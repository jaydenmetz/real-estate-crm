import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  Fade,
} from '@mui/material';
import {
  CheckCircle,
  Home,
  AttachMoney,
  Person,
  Business,
  Edit,
  Share,
  Print,
  ArrowForward,
  Phone,
  Email,
  Timeline,
  Assignment,
} from '@mui/icons-material';
import { safeFormatDate } from '../../utils/safeDateUtils';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

const EscrowCreated = ({ escrowData, onEdit, onViewDetails }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const navigate = useNavigate();

  // Get window dimensions for confetti
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  if (!escrowData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          No escrow data available. Please try creating a new escrow.
        </Alert>
      </Container>
    );
  }

  const handleViewFullDetails = () => {
    if (onViewDetails) {
      onViewDetails(escrowData.id);
    } else {
      navigate(`/escrows/${escrowData.id}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/escrows');
  };

  const calculateCommission = () => {
    const totalCommission = escrowData.purchasePrice * (escrowData.commissionPercentage / 100);
    return totalCommission / 2; // Assuming 50/50 split
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}

      <Fade in timeout={800}>
        <Box>
          {/* Success Header */}
          <Paper 
            sx={{ 
              p: 4, 
              mb: 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CheckCircle sx={{ fontSize: 80, color: 'white' }} />
            </Box>
            <Typography variant="h3" gutterBottom fontWeight="bold">
              Escrow Created Successfully! ✅
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Escrow #{escrowData.escrowNumber || 'TBD'} • {escrowData.propertyAddress}
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                  color: 'white'
                }}
                startIcon={<Edit />}
                onClick={onEdit}
              >
                Edit Details
              </Button>
              <Button
                variant="contained"
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                  color: 'white'
                }}
                startIcon={<ArrowForward />}
                onClick={handleViewFullDetails}
              >
                View Full Details
              </Button>
              <Button
                variant="outlined"
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
                startIcon={<Share />}
              >
                Share
              </Button>
            </Box>
          </Paper>

          {/* Escrow Details Grid */}
          <Grid container spacing={3}>
            {/* Property & Financial Info */}
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Home sx={{ mr: 1, verticalAlign: 'bottom' }} />
                    Property & Transaction Details
                  </Typography>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Property Address</strong></TableCell>
                        <TableCell>{escrowData.propertyAddress}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Property Type</strong></TableCell>
                        <TableCell>
                          <Chip 
                            label={escrowData.propertyType || 'Single Family'} 
                            color="primary" 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Purchase Price</strong></TableCell>
                        <TableCell>
                          <Typography variant="h6" color="primary">
                            ${escrowData.purchasePrice.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Acceptance Date</strong></TableCell>
                        <TableCell>{safeFormatDate(escrowData.acceptanceDate, 'MMMM d, yyyy')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Closing Date</strong></TableCell>
                        <TableCell>
                          <Typography color="success.main" fontWeight="bold">
                            {safeFormatDate(escrowData.closingDate, 'MMMM d, yyyy')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Commission ({escrowData.commissionPercentage}%)</strong></TableCell>
                        <TableCell>
                          <Typography color="success.main" fontWeight="bold">
                            ${calculateCommission().toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Your estimated commission
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Parties */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Person sx={{ mr: 1, verticalAlign: 'bottom' }} />
                    Transaction Parties
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* Buyers */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Buyers
                      </Typography>
                      {escrowData.buyers.map((buyer, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {buyer.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {buyer.name}
                            </Typography>
                            {buyer.email && (
                              <Typography variant="body2" color="text.secondary">
                                <Email sx={{ fontSize: 14, mr: 0.5 }} />
                                {buyer.email}
                              </Typography>
                            )}
                            {buyer.phone && (
                              <Typography variant="body2" color="text.secondary">
                                <Phone sx={{ fontSize: 14, mr: 0.5 }} />
                                {buyer.phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Grid>

                    {/* Sellers */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Sellers
                      </Typography>
                      {escrowData.sellers.map((seller, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                            {seller.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {seller.name}
                            </Typography>
                            {seller.email && (
                              <Typography variant="body2" color="text.secondary">
                                <Email sx={{ fontSize: 14, mr: 0.5 }} />
                                {seller.email}
                              </Typography>
                            )}
                            {seller.phone && (
                              <Typography variant="body2" color="text.secondary">
                                <Phone sx={{ fontSize: 14, mr: 0.5 }} />
                                {seller.phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Next Steps & Actions */}
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Assignment sx={{ mr: 1, verticalAlign: 'bottom' }} />
                    Next Steps
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Escrow created"
                        secondary="Just completed"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Timeline color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Open escrow account"
                        secondary="Next 1-2 business days"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Assignment color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Schedule inspection"
                        secondary="Within 10 days"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Business color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Order title report"
                        secondary="Within 3 days"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<Edit />}
                      onClick={onEdit}
                    >
                      Edit Escrow
                    </Button>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<Print />}
                    >
                      Print Summary
                    </Button>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<Assignment />}
                    >
                      View Checklist
                    </Button>
                    <Divider sx={{ my: 1 }} />
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={handleBackToDashboard}
                    >
                      Back to Escrows
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* AI Agent Notice */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>AI Team Notification:</strong> Your AI agents have been notified and will automatically:
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 0 }}>
              <li>Generate the escrow number</li>
              <li>Create task reminders for all deadlines</li>
              <li>Set up document workflows</li>
              <li>Begin monitoring transaction milestones</li>
            </Box>
          </Alert>
        </Box>
      </Fade>
    </Container>
  );
};

export default EscrowCreated;