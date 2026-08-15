import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import crmRoutes from './routes/crm.routes';
import financeRoutes from './routes/finance.routes';
import auditRoutes from './routes/audit.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'DataBeta MongoDB API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/audit', auditRoutes);

// Fallback 404
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err?.message || 'Internal server error.' });
});

// Connect to MongoDB and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[DataBeta Server] Running on http://localhost:${PORT}`);
  });
});

export default app;
