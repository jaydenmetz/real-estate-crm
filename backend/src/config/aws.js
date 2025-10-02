// backend/src/config/aws.js
const AWS = require('aws-sdk');

// Initialize from environment
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Export the S3 client (or any other AWS services you need)
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

module.exports = { s3 };
