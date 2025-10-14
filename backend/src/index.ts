import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import eventsRouter from './routes/events';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/events', eventsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 