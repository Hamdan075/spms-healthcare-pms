import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { router } from '../server/src/routes.js';
import { Project } from '../server/src/models.js';
import { seed } from '../server/src/seed.js';

const app = express();

app.use(cors());
app.use(express.json());

// Normalize URL in case Vercel rewrite passes the function path
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace(/^\/api\/index\.js/, '') || '/';
  }
  next();
});

// Cache database connection across serverless invocations
let isConnected = false;
let isConnecting = null;

async function ensureDBConnection() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  if (isConnecting) {
    await isConnecting;
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not defined. Please set it in Vercel project settings.');
  }

  isConnecting = mongoose.connect(uri);
  await isConnecting;
  isConnecting = null;
  isConnected = true;

  // Auto-seed if the database is newly initialized and empty
  try {
    const hasProjects = await Project.exists({});
    if (!hasProjects) {
      await seed();
      console.log('SPMS: Empty database detected; initial sample data loaded.');
    }
  } catch (seedErr) {
    console.error('SPMS: Seeding error:', seedErr);
  }
}

// Ensure database connection before any API endpoint runs
app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (err) {
    console.error('SPMS Database connection failure:', err);
    res.status(500).json({
      error: err.message || 'Database connection error. Ensure MONGO_URI is set in Vercel environment variables.',
    });
  }
});

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Root API information
app.get(['/api', '/'], (req, res) => {
  res.json({
    name: 'SPMS Healthcare PMS API',
    status: 'running',
    health: '/api/health',
  });
});

// Route handlers: support both /api/... and /...
app.use('/api', router);
app.use('/', router);

// Central error handler
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join('; ');
  }
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }
  if (status === 500) {
    console.error('Internal API error:', err);
  }
  res.status(status).json({ error: message });
});

export default app;
