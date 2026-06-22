const router        = require('express').Router();
const mlController  = require('../controllers/ml.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/',    mlController.getAllMLForecasts);
router.get('/one', mlController.getMLForecast);

module.exports = router;