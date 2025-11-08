import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AttachMoney,
  Receipt,
  TrendingUp,
  Email,
  Campaign,
  Business,
  People,
  LocationOn,
  Description,
  Assignment,
  Note,
  Timeline,
  Webhook,
  Delete,
  Policy,
  Settings,
  Analytics,
} from '@mui/icons-material';

const dataCategories = [
  {
    title: 'Financial',
    items: [
      { name: 'Commission Tracking', icon: <AttachMoney />, path: '/commissions', color: '#2e7d32' },
      { name: 'Expense Management', icon: <Receipt />, path: '/expenses', color: '#1976d2' },
      { name: 'Invoices', icon: <Description />, path: '/invoices', color: '#9c27b0' },
    ]
  },
  {
    title: 'Marketing',
    items: [
      { name: 'Marketing Campaigns', icon: <Campaign />, path: '/campaigns', color: '#d32f2f' },
      { name: 'Social Media Posts', icon: <TrendingUp />, path: '/social-media', color: '#1976d2' },
      { name: 'Email Templates', icon: <Email />, path: '/email-templates', color: '#388e3c' },
    ]
  },
  {
    title: 'Contacts & Resources',
    items: [
      { name: 'Vendors & Partners', icon: <Business />, path: '/vendors', color: '#f57c00' },
      { name: 'Referral Sources', icon: <People />, path: '/referral-sources', color: '#7b1fa2' },
      { name: 'Neighborhood Data', icon: <LocationOn />, path: '/neighborhoods', color: '#0288d1' },
    ]
  },
  {
    title: 'System & Documents',
    items: [
      { name: 'Document Library', icon: <Description />, path: '/documents', color: '#455a64' },
      { name: 'Contract Templates', icon: <Assignment />, path: '/templates', color: '#5d4037' },
      { name: 'All Notes', icon: <Note />, path: '/notes', color: '#00796b' },
      { name: 'Activity Log', icon: <Timeline />, path: '/activities', color: '#c2185b' },
      { name: 'Webhooks', icon: <Webhook />, path: '/webhooks', color: '#512da8' },
      { name: 'Deletion Requests', icon: <Delete />, path: '/deletion-requests', color: '#d32f2f' },
      { name: 'Compliance Reports', icon: <Policy />, path: '/compliance', color: '#1976d2' },
    ]
  },
  {
    title: 'Analytics & Settings',
    items: [
      { name: 'Analytics Dashboard', icon: <Analytics />, path: '/analytics', color: '#00897b' },
      { name: 'Settings', icon: <Settings />, path: '/settings', color: '#616161' },
    ]
  }
];

const OtherDataDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        All Features
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Access all areas of your Real Estate CRM
      </Typography>

      {dataCategories.map((category, categoryIndex) => (
        <Box key={categoryIndex} sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom color="primary">
            {category.title}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            {category.items.map((item, itemIndex) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={itemIndex}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(item.path)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: `${item.color}15`,
                            color: item.color,
                            mr: 2,
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography variant="h6" component="div">
                          {item.name}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );
};

export default OtherDataDashboard;