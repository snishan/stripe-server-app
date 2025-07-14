require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/paymentRoutes');
const connectDB = require('./config/db');
connectDB();

const app = express();

// Configure CORS to allow your frontend and ngrok
app.use(cors({
  origin: [
    'http://localhost:3000'
  ],
  credentials: true
}));

// Webhook route FIRST
app.post('/webhook', express.raw({type: 'application/json'}), require('./controllers/webhookController').handleWebhook);

// THEN body parsers for everything else
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Other routes
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));