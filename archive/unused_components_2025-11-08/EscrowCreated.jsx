import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Edit,
  Visibility,
  ArrowBack,
  Home,
  AttachMoney,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const EscrowCreated = ({ escrowData, onEdit, onViewDetails, onBack }) => {
  const { width, height } = useWindowSize();

  return (
    <>
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.1}
      />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
            </motion.div>

            <Typography variant="h4" gutterBottom fontWeight="bold">
              Escrow Created Successfully!
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              Your escrow has been created and is ready to track.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Escrow Details Summary */}
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Escrow Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Home fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Property Address
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {escrowData.propertyAddress}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Purchase Price
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      ${escrowData.purchasePrice?.toLocaleString()}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Closing Date
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {format(new Date(escrowData.closingDate), 'MMMM dd, yyyy')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Parties
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {escrowData.buyers?.join(', ')} → {escrowData.sellers?.join(', ')}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`Escrow #${escrowData.escrowNumber || 'Pending'}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={onBack}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => onEdit(escrowData)}
              >
                Edit Escrow
              </Button>
              <Button
                variant="contained"
                startIcon={<Visibility />}
                onClick={() => onViewDetails(escrowData.id)}
              >
                View Details
              </Button>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </>
  );
};

export default EscrowCreated;