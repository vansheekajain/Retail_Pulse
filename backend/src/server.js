require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;
let dbReadyPromise = null;

async function ensureDbConnection() {
  if (dbReadyPromise) {
    return dbReadyPromise;
  }

  dbReadyPromise = (async () => {
    try {
      await sequelize.authenticate();
      logger.info('✅ Database connected successfully');

      if (process.env.NODE_ENV !== 'production' || process.env.AUTO_SYNC_DB === 'true') {
        await sequelize.sync({ alter: true, logging: false });
        logger.info('✅ Database tables synced');
      }
    } catch (error) {
      dbReadyPromise = null;
      throw error;
    }
  })();

  return dbReadyPromise;
}

async function startServer() {
  try {
    await ensureDbConnection();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  ensureDbConnection,
  startServer,
};