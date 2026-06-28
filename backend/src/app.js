const express            = require('express');
const cors               = require('cors');
const helmet             = require('helmet');
const morgan             = require('morgan');
const rateLimit          = require('express-rate-limit');
const authRoutes         = require('./routes/auth.routes');
const salesRoutes        = require('./routes/sales.routes');
const storeRoutes        = require('./routes/store.routes');
const forecastRoutes     = require('./routes/forecast.routes');
const anomalyRoutes      = require('./routes/anomaly.routes');
const supplierRoutes     = require('./routes/supplier.routes');
const mlRoutes           = require('./routes/ml.routes');
const elasticityRoutes   = require('./routes/elasticity.routes');
const whatsappRoutes     = require('./routes/whatsapp.routes');
const debugRoutes        = require('./routes/debug.routes');
const errorHandler       = require('./middleware/errorHandler.middleware');

const app = express();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = new Set([
  frontendUrl,
  frontendUrl.replace('localhost', '127.0.0.1'),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean),
]);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.now.sh')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth',        authRoutes);
app.use('/api/sales',       salesRoutes);
app.use('/api/stores',      storeRoutes);
app.use('/api/forecast',    forecastRoutes);
app.use('/api/anomalies',   anomalyRoutes);
app.use('/api/suppliers',   supplierRoutes);
app.use('/api/ml',          mlRoutes);
app.use('/api/elasticity',  elasticityRoutes);
app.use('/api/debug',       debugRoutes);
app.use('/api/whatsapp',    whatsappRoutes);

app.use(errorHandler);

module.exports = app;