const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('phone')
    .optional()
    .trim(),
];

const loginRules = [
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('password')
    .notEmpty(),
];

router.post('/register', registerRules, authController.register);
router.post('/login',    loginRules,    authController.login);
router.get('/me',        authMiddleware, authController.me);
router.post('/logout',   authMiddleware, authController.logout);

module.exports = router;