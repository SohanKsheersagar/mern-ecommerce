const express = require('express');
const router = express.Router();

// Mount the Google/Facebook/email/password auth routes
router.use('/api/auth', require('./api/auth'));

// Fallback route for unknown API paths
router.use('/api', (req, res) => res.status(404).json('No API route found'));

module.exports = router;
