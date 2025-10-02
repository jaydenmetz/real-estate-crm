const express = require('express');
const OnboardingService = require('../services/onboarding.service');
const { authenticateAny } = require('../middleware/combinedAuth.middleware');

const router = express.Router();

/**
 * @route   GET /v1/onboarding/progress
 * @desc    Get current user's onboarding progress
 * @access  Private
 */
router.get('/progress', authenticateAny, async (req, res) => {
  try {
    const progress = await OnboardingService.getProgress(req.user.id);

    res.json({
      success: true,
      data: progress,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROGRESS_ERROR',
        message: 'Failed to fetch onboarding progress',
      },
    });
  }
});

/**
 * @route   POST /v1/onboarding/complete-step
 * @desc    Mark a tutorial step as completed
 * @access  Private
 * @body    { step: 'welcome' | 'escrow' | 'listings' | 'clients' | 'appointments' | 'leads' | 'marketplace' | 'features' }
 */
router.post('/complete-step', authenticateAny, async (req, res) => {
  try {
    const { step } = req.body;

    if (!step) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_STEP',
          message: 'Step parameter is required',
        },
      });
    }

    const validSteps = ['welcome', 'escrow', 'listings', 'clients', 'appointments', 'leads', 'marketplace', 'features'];
    if (!validSteps.includes(step)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STEP',
          message: `Invalid step. Must be one of: ${validSteps.join(', ')}`,
        },
      });
    }

    const progress = await OnboardingService.updateProgress(req.user.id, step);

    res.json({
      success: true,
      data: progress,
      message: `Step '${step}' completed successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error completing step:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPLETE_STEP_ERROR',
        message: error.message || 'Failed to complete step',
      },
    });
  }
});

/**
 * @route   POST /v1/onboarding/skip
 * @desc    Skip the tutorial (mark as skipped)
 * @access  Private
 */
router.post('/skip', authenticateAny, async (req, res) => {
  try {
    const progress = await OnboardingService.skipTutorial(req.user.id);

    res.json({
      success: true,
      data: progress,
      message: 'Tutorial skipped successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error skipping tutorial:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SKIP_TUTORIAL_ERROR',
        message: 'Failed to skip tutorial',
      },
    });
  }
});

/**
 * @route   POST /v1/onboarding/reset
 * @desc    Reset tutorial progress (for replay)
 * @access  Private
 */
router.post('/reset', authenticateAny, async (req, res) => {
  try {
    const progress = await OnboardingService.resetProgress(req.user.id);

    res.json({
      success: true,
      data: progress,
      message: 'Tutorial progress reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error resetting tutorial:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_TUTORIAL_ERROR',
        message: 'Failed to reset tutorial',
      },
    });
  }
});

/**
 * @route   GET /v1/onboarding/sample-data
 * @desc    Get sample data for current user (for tutorial display)
 * @access  Private
 */
router.get('/sample-data', authenticateAny, async (req, res) => {
  try {
    const sampleData = await OnboardingService.getSampleData(req.user.id);

    res.json({
      success: true,
      data: sampleData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching sample data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_SAMPLE_DATA_ERROR',
        message: 'Failed to fetch sample data',
      },
    });
  }
});

/**
 * @route   POST /v1/onboarding/generate-sample-data
 * @desc    Generate sample data for current user (manual trigger)
 * @access  Private
 */
router.post('/generate-sample-data', authenticateAny, async (req, res) => {
  try {
    const result = await OnboardingService.generateSampleData(req.user.id);

    res.json({
      success: true,
      data: result.data,
      sampleGroupId: result.sampleGroupId,
      message: 'Sample data generated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating sample data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATE_SAMPLE_DATA_ERROR',
        message: 'Failed to generate sample data',
      },
    });
  }
});

/**
 * @route   DELETE /v1/onboarding/sample-data
 * @desc    Delete all sample data for current user
 * @access  Private
 */
router.delete('/sample-data', authenticateAny, async (req, res) => {
  try {
    const result = await OnboardingService.deleteSampleData(req.user.id);

    res.json({
      success: true,
      data: result.deletedCounts,
      message: 'Sample data deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error deleting sample data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_SAMPLE_DATA_ERROR',
        message: 'Failed to delete sample data',
      },
    });
  }
});

/**
 * @route   POST /v1/onboarding/feedback
 * @desc    Submit feedback after tutorial completion
 * @access  Private
 * @body    { rating, nps, helpful, suggestions, featuresLiked, submittedAt }
 */
router.post('/feedback', authenticateAny, async (req, res) => {
  try {
    const feedback = req.body;

    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RATING',
          message: 'Rating must be between 1 and 5',
        },
      });
    }

    const result = await OnboardingService.submitFeedback(req.user.id, feedback);

    res.json({
      success: true,
      data: result,
      message: 'Feedback submitted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMIT_FEEDBACK_ERROR',
        message: 'Failed to submit feedback',
      },
    });
  }
});

/**
 * @route   GET /v1/onboarding/analytics
 * @desc    Get analytics/stats for current user's onboarding
 * @access  Private
 */
router.get('/analytics', authenticateAny, async (req, res) => {
  try {
    const analytics = await OnboardingService.getAnalytics(req.user.id);

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ANALYTICS_ERROR',
        message: 'Failed to fetch analytics',
      },
    });
  }
});

/**
 * @route   POST /v1/onboarding/track-timing
 * @desc    Track time spent on a tutorial step (for analytics)
 * @access  Private
 * @body    { step, timeSpentSeconds }
 */
router.post('/track-timing', authenticateAny, async (req, res) => {
  try {
    const { step, timeSpentSeconds } = req.body;

    if (!step || typeof timeSpentSeconds !== 'number') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TIMING_DATA',
          message: 'Step and timeSpentSeconds are required',
        },
      });
    }

    const result = await OnboardingService.trackStepTiming(req.user.id, step, timeSpentSeconds);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error tracking timing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TRACK_TIMING_ERROR',
        message: 'Failed to track timing',
      },
    });
  }
});

module.exports = router;
