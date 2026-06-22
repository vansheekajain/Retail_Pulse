const router = require('express').Router();
const { Store, User } = require('../models');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Debug endpoint to see what data belongs to current user
router.get('/profile', async (req, res, next) => {
  try {
    res.json({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      token: req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'none',
    });
  } catch (err) {
    next(err);
  }
});

router.get('/stores', async (req, res, next) => {
  try {
    const stores = await Store.findAll({
      where: { ownerId: req.user.id },
      attributes: ['id', 'name', 'ownerId', 'isActive', 'createdAt'],
    });
    
    const requestedStoreId = 'bf3d753f-9eae-419c-9602-2f554d004364';
    const requestedStore = await Store.findByPk(requestedStoreId, {
      attributes: ['id', 'name', 'ownerId', 'isActive', 'createdAt'],
    });
    
    res.json({
      currentUserId: req.user.id,
      storesOwnedCount: stores.length,
      storesOwned: stores,
      requestedStoreId,
      requestedStoreExists: !!requestedStore,
      requestedStoreData: requestedStore,
      isOwner: requestedStore?.ownerId === req.user.id,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
