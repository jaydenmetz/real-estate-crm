const express = require('express');

const router = express.Router();

// Debug endpoint to check what's being sent
router.post('/debug-login', (req, res) => {
  // // console.log('=== Login Debug ===');
  // // console.log('Headers:', req.headers);
  // // console.log('Body:', req.body);
  // // console.log('Content-Type:', req.headers['content-type']);

  res.json({
    success: true,
    data: {
      receivedBody: req.body,
      receivedHeaders: {
        contentType: req.headers['content-type'],
        authorization: req.headers.authorization,
      },
    },
  });
});

module.exports = router;
