import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Stack,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  School,
  PlayArrow,
  Refresh,
  Delete,
  Timeline,
  TrendingUp,
  AccessTime
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import OnboardingService from '../../services/onboarding.service';

const OnboardingSettings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);

  // Fetch onboarding progress (React Query v5)
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['onboarding-progress'],
    queryFn: () => OnboardingService.getProgress(),
    retry: 2,
    staleTime: 30000,
  });

  // Fetch sample data (React Query v5)
  const { data: sampleData, isLoading: sampleDataLoading } = useQuery({
    queryKey: ['onboarding-sample-data'],
    queryFn: () => OnboardingService.getSampleData(),
    retry: 2,
    staleTime: 30000,
  });

  // Fetch analytics (React Query v5)
  const { data: analytics } = useQuery({
    queryKey: ['onboarding-analytics'],
    queryFn: () => OnboardingService.getAnalytics(),
    retry: 2,
    staleTime: 60000,
    enabled: progress?.tutorial_completed,
  });

  // Delete sample data mutation
  const deleteSampleDataMutation = useMutation(
    () => OnboardingService.deleteSampleData(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['onboarding-sample-data'] });
        queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
        setDeleteDialog(false);
      },
    }
  );

  // Reset progress mutation
  const resetProgressMutation = useMutation(
    () => OnboardingService.resetProgress(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
        queryClient.invalidateQueries({ queryKey: ['onboarding-analytics'] });
        setResetDialog(false);
      },
    }
  );

  const steps = [
    { id: 'welcome', label: 'Welcome', completed: progress?.welcome_shown },
    { id: 'escrow', label: 'Escrow Tour', completed: progress?.escrow_tour_completed },
    { id: 'listings', label: 'Listings Tour', completed: progress?.listing_tour_completed },
    { id: 'clients', label: 'Clients Tour', completed: progress?.client_tour_completed },
    { id: 'appointments', label: 'Appointments Tour', completed: progress?.appointment_tour_completed },
    { id: 'leads', label: 'Leads Tour', completed: progress?.lead_tour_completed },
    { id: 'marketplace', label: 'Marketplace Intro', completed: progress?.marketplace_introduced },
    { id: 'features', label: 'Features Overview', completed: progress?.features_introduced },
  ];

  const completionPercentage = progress ? (progress.steps_completed / progress.total_steps) * 100 : 0;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Tutorial & Onboarding
      </Typography>

      <Stack spacing={3}>
        {/* Progress Card */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tutorial Progress
              </Typography>
              {progress?.tutorial_completed ? (
                <Chip icon={<CheckCircle />} label="Completed" color="success" />
              ) : progress?.skipped ? (
                <Chip label="Skipped" color="warning" />
              ) : (
                <Chip label="In Progress" color="primary" />
              )}
            </Box>

            {progressLoading ? (
              <LinearProgress />
            ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {progress?.steps_completed || 0} of {progress?.total_steps || 8} steps completed
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(completionPercentage)}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={completionPercentage} sx={{ height: 8, borderRadius: 4 }} />
                </Box>

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {!progress?.tutorial_completed && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={progress?.steps_completed > 0 ? <PlayArrow /> : <School />}
                      onClick={() => navigate(`/onboarding/${progress?.current_step || 'welcome'}`)}
                    >
                      {progress?.steps_completed > 0 ? 'Continue Tutorial' : 'Start Tutorial'}
                    </Button>
                  )}

                  {progress?.tutorial_completed && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => navigate('/onboarding/welcome')}
                    >
                      Replay Tutorial
                    </Button>
                  )}

                  {progress?.steps_completed > 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      startIcon={<Refresh />}
                      onClick={() => setResetDialog(true)}
                    >
                      Reset Progress
                    </Button>
                  )}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        {/* Steps Breakdown */}
        {progress && !progressLoading && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Tutorial Steps
              </Typography>
              <List dense>
                {steps.map((step, index) => (
                  <ListItem key={step.id} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      {step.completed ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                          }}
                        >
                          {index + 1}
                        </Box>
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={step.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          textDecoration: step.completed ? 'line-through' : 'none',
                          color: step.completed ? 'text.secondary' : 'text.primary',
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Analytics Card */}
        {progress?.tutorial_completed && analytics && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Timeline color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Completion Stats
                </Typography>
              </Box>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Completed On
                  </Typography>
                  <Typography variant="body1">
                    {analytics.completed_at ? new Date(analytics.completed_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>

                {analytics.total_time_seconds && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Time Spent
                    </Typography>
                    <Typography variant="body1">
                      {Math.floor(analytics.total_time_seconds / 60)} minutes
                    </Typography>
                  </Box>
                )}

                {analytics.average_step_time && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Average Time Per Step
                    </Typography>
                    <Typography variant="body1">
                      {Math.floor(analytics.average_step_time)} seconds
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Sample Data Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Sample Data
            </Typography>

            {sampleDataLoading ? (
              <LinearProgress />
            ) : progress?.sample_data_generated && !progress?.sample_data_deleted ? (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Tutorial sample data is currently active in your account. This includes example leads, appointments, clients, listings, and escrows.
                </Alert>

                {sampleData && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Sample Items:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {sampleData.lead && <Chip label="1 Lead" size="small" />}
                      {sampleData.appointment && <Chip label="1 Appointment" size="small" />}
                      {sampleData.client && <Chip label="1 Client" size="small" />}
                      {sampleData.listing && <Chip label="1 Listing" size="small" />}
                      {sampleData.escrow && <Chip label="1 Escrow" size="small" />}
                    </Stack>
                  </Paper>
                )}

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => setDeleteDialog(true)}
                  disabled={deleteSampleDataMutation.isLoading}
                >
                  {deleteSampleDataMutation.isLoading ? 'Deleting...' : 'Delete Sample Data'}
                </Button>
              </>
            ) : progress?.sample_data_deleted ? (
              <Alert severity="success">
                Sample data has been deleted. Your account only contains real data now.
              </Alert>
            ) : (
              <Alert severity="warning">
                No sample data generated yet. Complete the tutorial to see sample data.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Delete Sample Data Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Sample Data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all tutorial sample data from your account (1 lead, 1 appointment, 1 client, 1 listing, and 1 escrow).
            <br />
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={() => deleteSampleDataMutation.mutate()} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Progress Confirmation Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>Reset Tutorial Progress?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will reset your tutorial progress back to the beginning, but will keep your sample data intact.
            <br />
            <br />
            You can replay the tutorial from the start.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>Cancel</Button>
          <Button onClick={() => resetProgressMutation.mutate()} color="warning" variant="contained">
            Reset Progress
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingSettings;
