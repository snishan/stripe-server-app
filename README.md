# stripe-server-app

## Stripe Webhook Endpoint

**Important:**

When configuring your Stripe webhook, set the endpoint URL to:

```
https://<your-vercel-app>.vercel.app/webhook
```

- Replace `<your-vercel-app>` with your actual Vercel deployment name.
- Do **not** use the root URL (`/`). Only `/webhook` is supported by the server.

### Troubleshooting
- If you see `Cannot POST /` or a 404 error, your webhook is pointed at the wrong path. Update it to `/webhook` in the Stripe dashboard.
- If you get a 500 error, check your Vercel logs for details (missing environment variables, database issues, etc).