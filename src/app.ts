import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import dotenv from 'dotenv';

// Route files
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import contentRoutes from './routes/content.routes';
import settingsRoutes from './routes/settings.routes';

// Middleware
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app: Application = express();

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.MORGAN_FORMAT || 'combined'));
}

// Compression
app.use(compression());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Serve static files (uploads at project root or configured path)
const uploadsPath = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Real Estate Portfolio API Documentation'
}));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/settings', settingsRoutes);

// Health check route
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Handle undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler middleware
app.use(errorHandler);

export default app;

