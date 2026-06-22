const router               = require('express').Router();
const elasticityController = require('../controllers/elasticity.controller');
const authMiddleware       = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/price',       elasticityController.getPriceElasticity);
router.post('/competitor', elasticityController.getCompetitorImpact);

module.exports = router;