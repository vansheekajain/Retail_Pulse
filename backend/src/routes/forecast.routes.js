const router             = require('express').Router();
const forecastController = require('../controllers/forecast.controller');
const authMiddleware     = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/',    forecastController.getAllForecasts);
router.get('/one', forecastController.getForecast);

module.exports = router;