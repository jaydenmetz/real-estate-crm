const express = require('express');
const OnboardingService = require('../services/onboarding.service');
const { authenticateRequest } = require('../middleware/combinedAuth.middleware');

const router = express.Router();

/**
 * @route   GET /v1/onboarding/progress
 * @desc    Get current user's onboarding progress
 * @access  Private
 */
router.get('/progress', authenticateRequest, async (req, res) => {
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
router.post('/complete-step', authenticateRequest, async (req, res) => {
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
router.post('/skip', authenticateRequest, async (req, res) => {
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
router.post('/reset', authenticateRequest, async (req, res) => {
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
router.get('/sample-data', authenticateRequest, async (req, res) => {
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
router.post('/generate-sample-data', authenticateRequest, async (req, res) => {
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
router.delete('/sample-data', authenticateRequest, async (req, res) => {
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

module.exports = router;
