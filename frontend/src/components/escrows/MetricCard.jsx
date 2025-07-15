import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  Fade,
  Grow,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Paper,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Schedule,
  Warning,
  Info,
  AttachMoney,
  Assignment,
  Chat,
  CalendarToday,
  Person,
  Close,
} from '@mui/icons-material';

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  details,
  trend,
  escrowData 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    setTimeout(() => {
      if (!expanded) {
        setAnchorEl(null);
      }
    }, 200);
  };

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) {
      setHovering(false);
    } else {
      setAnchorEl(null);
    }
  };

  const renderDetailContent = () => {
    switch (title) {
      case 'Days to Close':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Timeline Breakdown
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CalendarToday sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Escrow Opened"
                  secondary={escrowData?.escrowOpenDate || 'Jan 15, 2025'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Schedule sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Expected Closing"
                  secondary={escrowData?.scheduledCoeDate || 'Feb 28, 2025'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Warning sx={{ fontSize: 20, color: 'warning.main' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Next Deadline"
                  secondary="Loan Approval - 3 days"
                />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Inspection completed (2 days ago)<br />
              • Appraisal ordered (5 days ago)<br />
              • Initial disclosures signed (7 days ago)
            </Typography>
          </Box>
        );

      case 'My Commission':
        const totalCommission = escrowData?.grossCommission || value * 2;
        const splits = {
          listing: totalCommission * 0.5,
          company: value * 0.2,
          net: value * 0.8
        };
        
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Commission Breakdown
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Total Commission"
                  secondary={`$${totalCommission?.toLocaleString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Your Side (50%)"
                  secondary={`$${value?.toLocaleString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Company Split (20%)"
                  secondary={`-$${splits.company?.toLocaleString()}`}
                  secondaryTypographyProps={{ color: 'error' }}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary={<strong>Net Commission</strong>}
                  secondary={<strong>${splits.net?.toLocaleString()}</strong>}
                  secondaryTypographyProps={{ color: 'success.main' }}
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Commission Rate: 2.5%<br />
                Payment Expected: At closing
              </Typography>
            </Box>
          </Box>
        );

      case 'Checklist Progress':
        const phases = [
          { name: 'Contract & Disclosures', progress: 100, items: 8 },
          { name: 'Inspections & Appraisal', progress: 75, items: 6 },
          { name: 'Loan Processing', progress: 40, items: 5 },
          { name: 'Closing Preparation', progress: 0, items: 7 }
        ];
        
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Phase Breakdown
            </Typography>
            {phases.map((phase, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{phase.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {phase.progress}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={phase.progress} 
                  sx={{ height: 4, borderRadius: 2 }}
                  color={phase.progress === 100 ? 'success' : 'primary'}
                />
                <Typography variant="caption" color="text.secondary">
                  {Math.floor(phase.items * phase.progress / 100)} of {phase.items} items complete
                </Typography>
              </Box>
            ))}
            <Button size="small" variant="outlined" fullWidth sx={{ mt: 2 }}>
              View Full Checklist
            </Button>
          </Box>
        );

      case 'Communication Score':
        const communications = [
          { type: 'Emails Sent', count: 24, icon: <Chat /> },
          { type: 'Calls Made', count: 8, icon: <Person /> },
          { type: 'Documents Shared', count: 15, icon: <Assignment /> },
          { type: 'Response Time', count: '< 2 hrs', icon: <Schedule /> }
        ];
        
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Communication Metrics
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress 
                variant="determinate" 
                value={value} 
                size={80}
                thickness={8}
                sx={{ color: 'success.main' }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" component="div" color="text.secondary">
                  {value}%
                </Typography>
              </Box>
            </Box>
            <List dense>
              {communications.map((comm, index) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {comm.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={comm.type}
                    secondary={comm.count}
                  />
                </ListItem>
              ))}
            </List>
            <Typography variant="caption" color="text.secondary">
              Last client contact: 2 hours ago
            </Typography>
          </Box>
        );

      default:
        return details;
    }
  };

  const open = Boolean(anchorEl) && hovering;

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
          ...(expanded && {
            zIndex: 1300,
            position: 'relative',
          })
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleExpand}
      >
        <CardContent>
          {/* Main Metric Display */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ color: `${color}.main` }}>
                  {icon}
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {title}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
                {typeof value === 'number' && title.includes('Commission') ? 
                  `$${value.toLocaleString()}` : 
                  value
                }
              </Typography>
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {trend > 0 ? (
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                  )}
                  <Typography 
                    variant="caption" 
                    color={trend > 0 ? 'success.main' : 'error.main'}
                  >
                    {Math.abs(trend)}% from last week
                  </Typography>
                </Box>
              )}
            </Box>
            <IconButton 
              size="small" 
              sx={{ mt: -1, mr: -1 }}
              onClick={(e) => {
                e.stopPropagation();
                handleExpand();
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Hover Preview Popup */}
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="top"
        transition
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
        sx={{ zIndex: 1200 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              sx={{
                p: 2,
                maxWidth: 300,
                boxShadow: 4,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Click to see detailed breakdown
              </Typography>
            </Paper>
          </Fade>
        )}
      </Popper>

      {/* Expanded Details Modal */}
      {expanded && (
        <ClickAwayListener onClickAway={() => setExpanded(false)}>
          <Paper
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bgcolor: 'background.paper',
              boxShadow: 12,
              borderRadius: 2,
              zIndex: 1400,
              minHeight: 400,
              width: '100%',
              minWidth: 350,
              animation: 'expandIn 0.3s ease-out',
              '@keyframes expandIn': {
                from: {
                  opacity: 0,
                  transform: 'scale(0.95)',
                },
                to: {
                  opacity: 1,
                  transform: 'scale(1)',
                },
              },
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{title}</Typography>
                <IconButton onClick={() => setExpanded(false)} size="small">
                  <Close />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {renderDetailContent()}
            </Box>
          </Paper>
        </ClickAwayListener>
      )}
    </>
  );
};

export default MetricCard;