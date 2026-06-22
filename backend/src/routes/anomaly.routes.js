const router            = require('express').Router();
const anomalyController = require('../controllers/anomaly.controller');
const authMiddleware    = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', anomalyController.getAnomalies);

module.exports = router;