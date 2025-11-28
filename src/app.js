import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './config/db.js';  // Connect to DB (now in src/config/)
import authRoutes from './routes/authRoutes.js';  // Now in src/routes/
import jobRoutes from './routes/jobRoutes.js';  // Now in src/routes/

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));  // Allow credentials for cookies
app.use(express.json());
app.use(cookieParser());  // For JWT cookies

// Routes
app.use('/api/auth', authRoutes);  // Keep as is, or change to /api/users if preferred
app.use('/api/jobs', jobRoutes);  // Added for job APIs

app.use((req, res, next) => {
  next();
});

export default app;
