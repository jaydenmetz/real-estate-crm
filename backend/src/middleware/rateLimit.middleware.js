const RateLimit = require('express-rate-limit')

module.exports = RateLimit({
  windowMs: 15 * 60 * 1000,
  max:  100
})