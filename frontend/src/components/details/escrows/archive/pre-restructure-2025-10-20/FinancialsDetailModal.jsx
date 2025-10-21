import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import { Close, TrendingUp, Edit } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import apiInstance from '../../../../services/api.service';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 600,
    width: '100%',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
  color: 'white',
}));

const FinancialRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
}));

const HighlightRow = styled(FinancialRow)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
  marginTop: theme.spacing(2),
}));

/**
 * FinancialsDetailModal - Phase 6 Full Implementation
 * Full commission waterfall with editable fields
 */
const FinancialsDetailModal = ({ open, onClose, escrow, onUpdate }) => {
  const [financials, setFinancials] = useState({
    grossCommission: 0,
    franchiseFees: 0,
    splitPercentage: 80,
    transactionFee: 285,
    tcFee: 250
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (escrow?.financials) {
      setFinancials({
        grossCommission: escrow.financials.grossCommission || 0,
        franchiseFees: escrow.financials.franchiseFees || 0,
        splitPercentage: escrow.financials.splitPercentage || 80,
        transactionFee: escrow.financials.transactionFee || 285,
        tcFee: escrow.financials.tcFee || 250
      });
    }
  }, [escrow]);

  const dealNet = financials.grossCommission - financials.franchiseFees;
  const agentCommission = dealNet * (financials.splitPercentage / 100);
  const agent1099Income = agentCommission - financials.transactionFee - financials.tcFee;

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSave = async () => {
    if (!escrow?.id) return;

    setSaving(true);
    setError(null);

    try {
      const response = await apiInstance.put(`/escrows/${escrow.id}/financials`, financials);

      if (response.data?.success) {
        if (onUpdate) {
          onUpdate({ financials });
        }
        onClose();
      } else {
        setError(response.data?.error?.message || 'Failed to save financials');
      }
    } catch (err) {
      console.error('Error saving financials:', err);
      setError(err.response?.data?.error?.message || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <Header>
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingUp />
          <Typography variant="h6" fontWeight="700">
            Financial Breakdown
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          sx={{ color: 'white', minWidth: 'auto', p: 0.5 }}
        >
          <Close />
        </Button>
      </Header>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          DEAL BREAKDOWN
        </Typography>

        {/* Gross Commission (Editable) */}
        <FinancialRow>
          <Typography variant="body2">Base Commission</Typography>
          <TextField
            size="small"
            type="number"
            value={financials.grossCommission}
            onChange={(e) => setFinancials({ ...financials, grossCommission: parseFloat(e.target.value) || 0 })}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{ width: 150 }}
          />
        </FinancialRow>

        {/* Franchise Fees (Editable) */}
        <FinancialRow>
          <Typography variant="body2" sx={{ pl: 2 }}>Franchise Fees</Typography>
          <TextField
            size="small"
            type="number"
            value={financials.franchiseFees}
            onChange={(e) => setFinancials({ ...financials, franchiseFees: parseFloat(e.target.value) || 0 })}
            InputProps={{
              startAdornment: <InputAdornment position="start">-$</InputAdornment>,
            }}
            sx={{ width: 150 }}
            color="error"
          />
        </FinancialRow>

        <Divider sx={{ my: 1 }} />

        {/* Deal Net (Calculated) */}
        <FinancialRow>
          <Typography variant="body2" fontWeight="600">Deal Net</Typography>
          <Typography variant="body2" fontWeight="600">{formatCurrency(dealNet)}</Typography>
        </FinancialRow>

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          AGENT SPLIT
        </Typography>

        {/* Split Percentage (Editable) */}
        <FinancialRow>
          <Typography variant="body2">Agent Commission %</Typography>
          <TextField
            size="small"
            type="number"
            value={financials.splitPercentage}
            onChange={(e) => setFinancials({ ...financials, splitPercentage: parseFloat(e.target.value) || 0 })}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            sx={{ width: 100 }}
          />
        </FinancialRow>

        {/* Agent Commission (Calculated) */}
        <FinancialRow>
          <Typography variant="body2" sx={{ pl: 2 }}>Agent Commission</Typography>
          <Typography variant="body2" fontWeight="600">{formatCurrency(agentCommission)}</Typography>
        </FinancialRow>

        {/* Transaction Fee (Editable) */}
        <FinancialRow>
          <Typography variant="body2" sx={{ pl: 2 }}>Transaction Fee</Typography>
          <TextField
            size="small"
            type="number"
            value={financials.transactionFee}
            onChange={(e) => setFinancials({ ...financials, transactionFee: parseFloat(e.target.value) || 0 })}
            InputProps={{
              startAdornment: <InputAdornment position="start">-$</InputAdornment>,
            }}
            sx={{ width: 150 }}
            color="error"
          />
        </FinancialRow>

        {/* TC Fee (Editable) */}
        <FinancialRow>
          <Typography variant="body2" sx={{ pl: 2 }}>TC Fee</Typography>
          <TextField
            size="small"
            type="number"
            value={financials.tcFee}
            onChange={(e) => setFinancials({ ...financials, tcFee: parseFloat(e.target.value) || 0 })}
            InputProps={{
              startAdornment: <InputAdornment position="start">-$</InputAdornment>,
            }}
            sx={{ width: 150 }}
            color="error"
          />
        </FinancialRow>

        {/* Agent Net (Calculated, Highlighted) */}
        <HighlightRow sx={{ backgroundColor: 'primary.main', color: 'white' }}>
          <Typography variant="body1" fontWeight="700">
            Agent Net (1099)
          </Typography>
          <Typography variant="h6" fontWeight="700">
            {formatCurrency(agent1099Income)}
          </Typography>
        </HighlightRow>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" color="info.dark">
            💡 Tip: Franchise fees are typically 6.25% of gross commission. Transaction and TC fees are standard per your brokerage agreement.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default FinancialsDetailModal;
