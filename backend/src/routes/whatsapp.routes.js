const router             = require('express').Router();
const whatsappController = require('../controllers/whatsapp.controller');
const authMiddleware     = require('../middleware/auth.middleware');

// Webhook — NO auth (called by Meta servers)
router.get('/webhook',  whatsappController.verifyWebhook);
router.post('/webhook', whatsappController.handleIncoming);

// Protected routes
router.post(
  '/nudge',
  authMiddleware,
  whatsappController.sendDailyNudge
);

module.exports = router;