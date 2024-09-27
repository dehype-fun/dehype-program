import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './utils/swagger';

import userRoutes from './routes/user';
import coinRoutes from './routes/coin';
import messageRoutes from './routes/feedback';
import coinTradeRoutes from './routes/coinTradeRoutes';
import chartRoutes from './routes/chart';
import uploadRoutes from './routes/upload';
import marketRoutes from './routes/market';
import { init } from './db/dbConncetion';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from the .env file

const app = express();
const PORT = process.env.PORT || 5050;


// Swagger setup
const allowedOrigin = process.env.FRONTEND_URL || '*'; // If FRONTEND_URL is set, use it, otherwise allow all origins

// Swagger setup
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    // If there's no FRONTEND_URL defined, allow all origins
    if (!process.env.FRONTEND_URL || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

init();

app.use('/upload', uploadRoutes);
app.use('/user/', userRoutes);
app.use('/coin/', coinRoutes);
app.use('/feedback/', messageRoutes);
app.use('/cointrade/', coinTradeRoutes);
app.use('/chart/', chartRoutes);
app.use('/market', marketRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, api-docs available at http://localhost:${PORT}/api-docs`);

});

export default app;
