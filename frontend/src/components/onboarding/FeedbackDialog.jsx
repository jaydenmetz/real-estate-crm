import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Rating,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Stack,
  IconButton,
  Slider,
  Alert
} from '@mui/material';
import { Close, ThumbUp, ThumbDown, Star, Send } from '@mui/icons-material';
import { motion } from 'framer-motion';
import OnboardingService from '../../services/onboarding.service';

const FeedbackDialog = ({ open, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [nps, setNps] = useState(5);
  const [helpful, setHelpful] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const features = [
    'Sample Data',
    'Step Animations',
    'Mobile Gestures',
    'Keyboard Navigation',
    'Visual Design',
    'Clear Instructions',
    'Commission Example',
    'Marketplace Preview'
  ];

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const feedback = {
        rating,
        nps,
        helpful,
        suggestions,
        featuresLiked: selectedFeatures,
        submittedAt: new Date().toISOString()
      };

      await OnboardingService.submitFeedback(feedback);
      setSubmitted(true);

      // Close dialog after 2 seconds
      setTimeout(() => {
        onSubmit?.(feedback);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (submitted) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <ThumbUp sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
            </motion.div>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Thank You!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your feedback helps us improve the onboarding experience.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleSkip} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            How was your tutorial experience?
          </Typography>
          <IconButton onClick={handleSkip} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Overall Rating */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Overall Rating <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                size="large"
                icon={<Star fontSize="inherit" />}
              />
              {rating > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Needs Improvement'}
                </Typography>
              )}
            </Box>
          </Box>

          {/* NPS Score */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              How likely are you to recommend this CRM to other agents?
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={nps}
                onChange={(e, value) => setNps(value)}
                min={0}
                max={10}
                marks
                valueLabelDisplay="on"
                sx={{
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: nps >= 9 ? '#10b981' : nps >= 7 ? '#f59e0b' : '#ef4444',
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">Not Likely</Typography>
                <Typography variant="caption" color="text.secondary">Very Likely</Typography>
              </Box>
            </Box>
          </Box>

          {/* What was helpful */}
          <Box>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                Was the tutorial helpful?
              </FormLabel>
              <RadioGroup value={helpful} onChange={(e) => setHelpful(e.target.value)} row>
                <FormControlLabel
                  value="very_helpful"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThumbUp fontSize="small" color="success" />
                      Very Helpful
                    </Box>
                  }
                />
                <FormControlLabel
                  value="somewhat_helpful"
                  control={<Radio />}
                  label="Somewhat"
                />
                <FormControlLabel
                  value="not_helpful"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThumbDown fontSize="small" color="error" />
                      Not Helpful
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Features Liked */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Which features did you like most? (Select all that apply)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {features.map(feature => (
                <Chip
                  key={feature}
                  label={feature}
                  onClick={() => handleFeatureToggle(feature)}
                  color={selectedFeatures.includes(feature) ? 'primary' : 'default'}
                  variant={selectedFeatures.includes(feature) ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>

          {/* Suggestions */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Suggestions for Improvement (Optional)
            </Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Tell us how we can make the tutorial better..."
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              variant="outlined"
            />
          </Box>

          {error && (
            <Alert severity="error">{error}</Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleSkip} color="inherit">
          Skip
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          startIcon={<Send />}
          sx={{
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(90deg, #5568d3 0%, #66438e 100%)',
            }
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;
