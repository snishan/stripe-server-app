require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/paymentRoutes');
const connectDB = require('./config/db');
connectDB();

const app = express();

app.use(cors());

// Webhook endpoint needs raw body - must be before body parsers
app.post('/webhook', express.raw({type: 'application/json'}), require('./controllers/webhookController').handleWebhook);

// Body parsers for all other routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));