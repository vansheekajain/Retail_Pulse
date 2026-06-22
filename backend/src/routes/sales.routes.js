const router          = require('express').Router();
const { body }        = require('express-validator');
const salesController = require('../controllers/sales.controller');
const authMiddleware  = require('../middleware/auth.middleware');

// All routes require login
router.use(authMiddleware);

const saleRules = [
  body('storeId')
    .notEmpty()
    .withMessage('storeId is required'),
  body('productId')
    .notEmpty()
    .withMessage('productId is required'),
  body('qty')
    .isFloat({ min: 0.01 })
    .withMessage('qty must be greater than 0'),
  body('unitPrice')
    .isFloat({ min: 0 })
    .withMessage('unitPrice must be a valid number'),
  body('loggedVia')
    .optional()
    .isIn(['chat', 'form', 'whatsapp', 'api']),
  body('saleDate')
    .optional()
    .isDate(),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 }),
];

router.post('/',          saleRules, salesController.createSale);
router.get('/',                      salesController.getSales);
router.get('/summary',               salesController.getDailySummary);
router.get('/:id',                   salesController.getSaleById);
router.put('/:id',        saleRules, salesController.updateSale);
router.delete('/:id',                salesController.deleteSale);

module.exports = router;