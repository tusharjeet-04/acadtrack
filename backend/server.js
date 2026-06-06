import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';

// Load Env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
const frontendOrigin = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.trim().replace(/\/$/, '')
  : '*';

app.use(cors({
  origin: frontendOrigin,
  credentials: true,
}));
app.use(express.json());

// Set up __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/academics', academicRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notices', noticeRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('AcadTrack MERN Backend API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('API Error:', err.stack);
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
