# 💳 Stripe Payment Server

A robust Node.js server application for handling Stripe payments, subscriptions, and webhooks with clean separation between one-time payments and subscriptions.

## ✨ Features

- 🔄 **Separate Payment Routes**: Clean separation between one-time payments and subscriptions
- 🛡️ **Webhook Security**: Secure webhook signature verification
- 📊 **Payment Tracking**: Comprehensive payment logging and database storage
- 🔧 **Easy Configuration**: Environment-based configuration
- 🚀 **Production Ready**: Deployable to Vercel, Heroku, or any Node.js hosting

## 🏗️ Architecture

```
stripe-server-app/
├── config/
│   ├── db.js          # Database configuration
│   └── stripe.js      # Stripe configuration
├── controllers/
│   ├── paymentController.js    # Payment logic
│   └── webhookController.js    # Webhook handling
├── models/
│   └── Payment.js     # Payment model
├── routes/
│   └── paymentRoutes.js       # API routes
├── server.js          # Main server file
└── vercel.json        # Vercel deployment config
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/snishan/stripe-server-app.git
   cd stripe-server-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp sample.env .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   MONGODB_URI=mongodb://localhost:27017/your_database
   PORT=3000
   CHECKOUT_SUCCESS_URL=http://localhost:3000/success
   CHECKOUT_CANCEL_URL=http://localhost:3000/cancel
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## 📚 API Documentation

### One-Time Payment

**Endpoint:** `POST /pay/one-time`

**Request Body:**
```json
{
  "email": "customer@example.com",
  "name": "Product Name",
  "priceId": "price_1234567890",
  "userId": "user123",
  "productId": "prod_123"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_1234567890"
}
```

### Subscription Payment

**Endpoint:** `POST /pay/subscription`

**Request Body:**
```json
{
  "email": "customer@example.com",
  "name": "Premium Plan",
  "priceId": "price_1234567890",
  "userId": "user123",
  "productId": "prod_123"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_1234567890"
}
```

### Cancel Subscription

**Endpoint:** `POST /cancel-subscription`

**Request Body:**
```json
{
  "subscriptionId": "sub_1234567890"
}
```

### Create Payment Intent (Direct)

**Endpoint:** `POST /create-payment-intent`

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "usd",
  "userId": "user123",
  "productId": "prod_123",
  "email": "customer@example.com"
}
```

## 🔗 Webhook Events

The server handles the following Stripe webhook events:

- `checkout.session.completed` - Payment completed via Checkout Session

### Webhook Setup

1. **Configure webhook endpoint in Stripe Dashboard:**
   ```
   URL: https://your-domain.com/webhook
   Events: checkout.session.completed
   ```

2. **Get webhook secret and add to environment variables**

## 🗄️ Database Schema

### Payment Model

```javascript
{
  userId: String,
  productId: String,
  amount: Number,
  currency: String,
  paymentIntentId: String,
  status: String,
  type: String, // 'payment' or 'subscription'
  subscriptionId: String,
  currentPeriodEnd: Date,
  lastPaymentDate: Date,
  email: String
}
```

## 🛠️ Development

### Running in Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Webhook endpoint secret | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `PORT` | Server port | ❌ (default: 3000) |
| `CHECKOUT_SUCCESS_URL` | Success page URL | ❌ |
| `CHECKOUT_CANCEL_URL` | Cancel page URL | ❌ |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/stripe-server-app/issues) page
2. Create a new issue with detailed information
3. Contact: your-email@example.com

## 🙏 Acknowledgments

- [Stripe](https://stripe.com/) for the payment processing platform
- [Node.js](https://nodejs.org/) for the runtime environment
- [Express.js](https://expressjs.com/) for the web framework

---

⭐ **Star this repository if you find it helpful!**
