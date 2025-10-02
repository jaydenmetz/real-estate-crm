const express = require('express');

const router = express.Router();
const ApiKeyService = require('../services/apiKey.service');
const SecurityEventService = require('../services/securityEvent.service');
const { authenticate } = require('../middleware/auth.middleware');

// All API key routes require authentication
router.use(authenticate);

// GET /v1/api-keys - List user's API keys
router.get('/', async (req, res) => {
  try {
    const apiKeys = await ApiKeyService.listUserApiKeys(req.user.id);

    res.json({
      success: true,
      data: apiKeys,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_FAILED',
        message: 'Failed to list API keys',
      },
    });
  }
});

// POST /v1/api-keys - Create new API key
router.post('/', async (req, res) => {
  try {
    const { name, expiresInDays } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'API key name is required',
        },
      });
    }

    const apiKey = await ApiKeyService.createApiKey(
      req.user.id,
      name,
      expiresInDays,
    );

    // Log API key creation (fire-and-forget)
    SecurityEventService.logApiKeyCreated(req, req.user, apiKey.id, name).catch(console.error);

    res.status(201).json({
      success: true,
      data: apiKey,
      message: 'API key created successfully. Save this key securely - it will not be shown again.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create API key',
      },
    });
  }
});

// PUT /v1/api-keys/:id/revoke - Revoke an API key
router.put('/:id/revoke', async (req, res) => {
  try {
    // Get key name before revoking
    const keys = await ApiKeyService.listUserApiKeys(req.user.id);
    const keyToRevoke = keys.find((k) => k.id === req.params.id);

    const result = await ApiKeyService.revokeApiKey(req.user.id, req.params.id);

    // Log API key revocation (fire-and-forget)
    SecurityEventService.logApiKeyRevoked(
      req,
      req.user,
      req.params.id,
      keyToRevoke?.name || 'Unknown',
    ).catch(console.error);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error revoking API key:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'REVOKE_FAILED',
        message: 'Failed to revoke API key',
      },
    });
  }
});

// DELETE /v1/api-keys/:id - Delete an API key
router.delete('/:id', async (req, res) => {
  try {
    const result = await ApiKeyService.deleteApiKey(req.user.id, req.params.id);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error deleting API key:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete API key',
      },
    });
  }
});

module.exports = router;
