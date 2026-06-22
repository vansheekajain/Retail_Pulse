const router              = require('express').Router();
const supplierController  = require('../controllers/supplier.controller');
const authMiddleware      = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/',    supplierController.getSuppliers);
router.post('/',   supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

router.get('/po',       supplierController.getPOs);
router.post('/po',      supplierController.createPO);
router.put('/po/:id',   supplierController.updatePOStatus);

module.exports = router;