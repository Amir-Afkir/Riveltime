import express from 'express';
const router = express.Router();

router.get('/health', (req, res) => {
  res.send('✅ API Riveltime OK');
});

export default router;