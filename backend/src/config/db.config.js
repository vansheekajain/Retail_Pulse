require('dotenv').config();

const baseConfig = {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
};

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || process.env.DB_URL;

module.exports = {
  development: {
    ...baseConfig,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hyperlocal_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
  },
  production: {
    ...baseConfig,
    ...(databaseUrl
      ? { url: databaseUrl }
      : {
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT, 10) || 5432,
        }),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};