import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ArrowBack,
  Home,
  AttachMoney,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import { escrowsAPI } from '../../services/api';

const NewEscrow = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    propertyAddress: '',
    purchasePrice: '',
    myCommission: '',
    acceptanceDate: new Date(),
    scheduledCoeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    escrowStatus: 'Active',
    myRole: 'Listing Agent',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
  });

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleDateChange = (field) => (date) => {
    setFormData({
      ...formData,
      [field]: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calculate commission if not provided
      const commission = formData.myCommission || (parseFloat(formData.purchasePrice) * 0.025);

      const escrowData = {
        propertyAddress: formData.propertyAddress,
        purchasePrice: parseFloat(formData.purchasePrice),
        myCommission: parseFloat(commission),
        acceptanceDate: formData.acceptanceDate.toISOString(),
        scheduledCoeDate: formData.scheduledCoeDate.toISOString(),
        escrowStatus: formData.escrowStatus,
        myRole: formData.myRole,
        buyer: {
          name: formData.buyerName,
          email: formData.buyerEmail,
          phone: formData.buyerPhone,
        },
        seller: {
          name: formData.sellerName,
          email: formData.sellerEmail,
          phone: formData.sellerPhone,
        },
      };

      const response = await escrowsAPI.create(escrowData);

      if (response.success) {
        // Navigate to the new escrow detail page
        navigate(`/escrows/${response.data.id}`);
      } else {
        setError(response.error?.message || 'Failed to create escrow');
      }
    } catch (err) {
      console.error('Error creating escrow:', err);
      setError('An error occurred while creating the escrow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/escrows')}
            sx={{ mr: 2 }}
          >
            Back to Escrows
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Create New Escrow
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Property Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Home color="primary" />
                  Property Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Property Address"
                  value={formData.propertyAddress}
                  onChange={handleChange('propertyAddress')}
                  placeholder="123 Main St, Los Angeles, CA 90001"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Purchase Price"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={handleChange('purchasePrice')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="My Commission"
                  type="number"
                  value={formData.myCommission}
                  onChange={handleChange('myCommission')}
                  helperText="Leave blank to calculate 2.5%"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="My Role"
                  value={formData.myRole}
                  onChange={handleChange('myRole')}
                >
                  <MenuItem value="Listing Agent">Listing Agent</MenuItem>
                  <MenuItem value="Buyer Agent">Buyer Agent</MenuItem>
                  <MenuItem value="Dual Agent">Dual Agent</MenuItem>
                </TextField>
              </Grid>

              {/* Important Dates */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <CalendarToday color="primary" />
                  Important Dates
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Acceptance Date"
                  value={formData.acceptanceDate}
                  onChange={handleDateChange('acceptanceDate')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Scheduled COE Date"
                  value={formData.scheduledCoeDate}
                  onChange={handleDateChange('scheduledCoeDate')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Escrow Status"
                  value={formData.escrowStatus}
                  onChange={handleChange('escrowStatus')}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>

              {/* Buyer Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <Person color="primary" />
                  Buyer Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Buyer Name"
                  value={formData.buyerName}
                  onChange={handleChange('buyerName')}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Buyer Email"
                  type="email"
                  value={formData.buyerEmail}
                  onChange={handleChange('buyerEmail')}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Buyer Phone"
                  value={formData.buyerPhone}
                  onChange={handleChange('buyerPhone')}
                />
              </Grid>

              {/* Seller Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <Person color="primary" />
                  Seller Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Seller Name"
                  value={formData.sellerName}
                  onChange={handleChange('sellerName')}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Seller Email"
                  type="email"
                  value={formData.sellerEmail}
                  onChange={handleChange('sellerEmail')}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Seller Phone"
                  value={formData.sellerPhone}
                  onChange={handleChange('sellerPhone')}
                />
              </Grid>

              {/* Submit Buttons */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/escrows')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Creating...' : 'Create Escrow'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default NewEscrow;