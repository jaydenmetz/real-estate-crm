import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Info,
  AttachMoney,
  Home,
  Schedule,
  Assignment,
} from '@mui/icons-material';

const StatsFullView = ({ open, onClose, stats, escrows, showCommission }) => {
  const theme = useTheme();

  const getActiveEscrows = () => escrows.filter(e => e.escrowStatus?.toLowerCase() === 'active');
  const getClosingThisWeek = () => escrows.filter(e => {
    const days = e.daysToClose !== undefined ? e.daysToClose : 
      (e.closingDate || e.scheduledCoeDate ? 
        Math.floor((new Date(e.closingDate || e.scheduledCoeDate) - new Date()) / (1000 * 60 * 60 * 24)) : null);
    return days !== null && days >= 0 && days <= 7 && e.escrowStatus?.toLowerCase() === 'active';
  });

  const getVolumeByStatus = (status) => {
    return escrows
      .filter(e => e.escrowStatus?.toLowerCase() === status.toLowerCase())
      .reduce((sum, e) => sum + (e.purchasePrice || 0), 0);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: theme.palette.primary.main,
        color: 'white',
      }}>
        <Typography variant="h5" fontWeight="bold">
          Escrow Statistics Overview
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Active Escrows */}
          <Grid item xs={12} md={6} lg={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                }}>
                  <Home fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {stats.totalActive}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Escrows
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Priority Breakdown
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Warning sx={{ color: 'error.main', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="High Priority" 
                    secondary={`${getActiveEscrows().filter(e => e.priorityLevel === 'high').length} escrows`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Info sx={{ color: 'info.main', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Normal Priority" 
                    secondary={`${getActiveEscrows().filter(e => e.priorityLevel !== 'high').length} escrows`}
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Recent Activity
                </Typography>
                {getActiveEscrows().slice(0, 3).map((escrow, index) => (
                  <Paper key={escrow.id} sx={{ p: 1.5, mb: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" fontWeight="medium">
                      {escrow.propertyAddress}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {escrow.currentStage || 'In Progress'}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Closing This Week */}
          <Grid item xs={12} md={6} lg={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: 'warning.main',
                }}>
                  <Warning fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.closingThisWeek}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Closing This Week
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Urgent Closings
              </Typography>
              
              {getClosingThisWeek().length > 0 ? (
                <List dense>
                  {getClosingThisWeek().map((escrow) => (
                    <ListItem key={escrow.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap>
                            {escrow.propertyAddress}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule sx={{ fontSize: 14 }} />
                            <Typography variant="caption">
                              {escrow.daysToClose} days remaining
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No escrows closing this week
                </Typography>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Action Required
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Assignment sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Final walkthroughs"
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Closing documents"
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Grid>

          {/* Total Volume */}
          <Grid item xs={12} md={6} lg={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: 'success.main',
                }}>
                  <AttachMoney fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {showCommission ? `$${(stats.totalVolume / 1000000).toFixed(1)}M` : '•••••'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Volume
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {showCommission ? (
                <>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    Volume by Status
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ py: 1 }}>Active</TableCell>
                        <TableCell align="right" sx={{ py: 1 }}>
                          ${(getVolumeByStatus('active') / 1000000).toFixed(1)}M
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 1 }}>Pending</TableCell>
                        <TableCell align="right" sx={{ py: 1 }}>
                          ${(getVolumeByStatus('pending') / 1000000).toFixed(1)}M
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 1 }}>Closed</TableCell>
                        <TableCell align="right" sx={{ py: 1 }}>
                          ${(getVolumeByStatus('closed') / 1000000).toFixed(1)}M
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                      Commission Projection
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estimated: ${((stats.totalVolume * 0.025) / 1000).toFixed(0)}K
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Based on 2.5% average commission
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Commission details are hidden
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Toggle commission visibility to view
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Average Days to Close */}
          <Grid item xs={12} md={6} lg={3}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: 'info.main',
                }}>
                  <Schedule fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats.avgDaysToClose}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Days to Close
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Performance Analysis
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Your Average</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.avgDaysToClose} days
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Industry Average</Typography>
                  <Typography variant="body2">43 days</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Difference</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stats.avgDaysToClose < 43 ? (
                      <TrendingDown sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <TrendingUp sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={stats.avgDaysToClose < 43 ? 'success.main' : 'error.main'}
                    >
                      {Math.abs(stats.avgDaysToClose - 43)} days
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={(stats.avgDaysToClose / 60) * 100} 
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              
              <Typography variant="caption" color="text.secondary">
                {stats.avgDaysToClose < 43 
                  ? `You're ${((43 - stats.avgDaysToClose) / 43 * 100).toFixed(0)}% faster than average!`
                  : `Consider process optimization to improve closing times.`
                }
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatsFullView;