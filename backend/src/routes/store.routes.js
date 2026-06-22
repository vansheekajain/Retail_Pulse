const router          = require('express').Router();
const { body, param } = require('express-validator');
const storeController = require('../controllers/store.controller');
const authMiddleware  = require('../middleware/auth.middleware');

// All routes require login
router.use(authMiddleware);

const storeIdRule = param('storeId')
  .isUUID()
  .withMessage('Invalid store ID');

const productIdRule = param('productId')
  .isUUID()
  .withMessage('Invalid product ID');

const storeRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required'),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('pincode').optional().trim(),
  body('category')
    .optional()
    .isIn([
      'grocery', 'pharmacy', 'electronics',
      'clothing', 'restaurant', 'other',
    ]),
];

const productRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Valid price is required'),
  body('unit')
    .optional()
    .isIn(['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'box', 'packet']),
];

// ── Store routes ──────────────────────────────────────
router.post('/',             storeRules,   storeController.createStore);
router.get('/',                            storeController.getMyStores);
router.get('/:storeId',                    storeIdRule, storeController.getStoreById);
router.put('/:storeId',      [storeIdRule, ...storeRules],   storeController.updateStore);
router.delete('/:storeId',                 storeIdRule, storeController.deleteStore);

// ── Product routes ────────────────────────────────────
router.post('/:storeId/products',              [storeIdRule, ...productRules], storeController.addProduct);
router.get('/:storeId/products',                  storeIdRule, storeController.getProducts);
router.put('/:storeId/products/:productId',      [storeIdRule, productIdRule, ...productRules], storeController.updateProduct);
router.delete('/:storeId/products/:productId',   [storeIdRule, productIdRule], storeController.deleteProduct);

module.exports = router;