// backend/routes/testRoutes.js
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.send('✅ API Riveltime OK');
});

module.exports = router;