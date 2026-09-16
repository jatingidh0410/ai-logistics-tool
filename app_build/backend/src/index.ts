import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initDb } from './db/index.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api', shipmentRoutes);
app.use('/api/ai', aiRoutes);


// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Nagarkot Shipment Tracker Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Root Route
app.get('/', (req, res) => {
  res.send('Nagarkot Logistics API Service is active.');
});

// Server Initialization
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📍 Health Check available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to launch backend server:', error);
    process.exit(1);
  }
}

startServer();
