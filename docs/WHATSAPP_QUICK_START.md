# WhatsApp Disease Detection - Quick Start

Get WhatsApp plant disease detection running in 30 minutes!

## Step 1: Enable WhatsApp (5 min)

1. Login to [Africa's Talking Dashboard](https://account.africastalking.com)
2. Navigate to **WhatsApp** section
3. Click **"Apply for WhatsApp Business API"**
4. Fill in business details
5. Wait for approval email (1-2 weeks)

## Step 2: Configure Webhook (2 min)

Once approved:

1. Go to **WhatsApp** > **Settings**
2. Set Webhook URL: `https://your-domain.com/whatsapp/incoming`
3. Enable **"Receive Images"**
4. Save configuration

## Step 3: Update Environment (1 min)

Add to `.env`:

```bash
# Your existing config...

# Add this for WhatsApp
WHATSAPP_WEBHOOK_URL=https://your-domain.com/whatsapp/incoming
```

## Step 4: Run Migration (1 min)

```bash
npm run migrate
```

Creates `whatsapp_sessions` and `plant_analyses` tables.

## Step 5: Restart Server (1 min)

```bash
# Development
npm run dev

# Production
pm2 restart agronomic-chatbot
```

## Step 6: Test (5 min)

1. **Send "Hi"** to your WhatsApp Business number
2. **Receive** welcome message
3. **Send plant photo**
4. **Get diagnosis** in ~10 seconds!

## Common Issues

### 1. "Webhook not receiving messages"

**Check**:
- URL is HTTPS (not HTTP)
- Server is publicly accessible
- Firewall allows Africa's Talking IPs

**Test**:
```bash
curl https://your-domain.com/whatsapp/incoming
```

### 2. "Image analysis fails"

**Check**:
- `ANTHROPIC_API_KEY` is set correctly
- API key has Claude 3.5 Sonnet access
- Image size < 5MB

**Test**:
```bash
# Check logs
pm2 logs agronomic-chatbot
```

### 3. "Session not found"

**Check**:
- Redis is running
- Redis connection string is correct

**Test**:
```bash
redis-cli ping
# Should return: PONG
```

## Next Steps

- Read full guide: [WHATSAPP_GUIDE.md](../WHATSAPP_GUIDE.md)
- Add custom diseases: Edit `src/services/diseaseKnowledge.service.ts`
- Customize messages: Edit `src/services/whatsapp.service.ts`
- Add products: Use seed script or admin panel

## Support

- **Technical**: Create GitHub issue
- **WhatsApp Setup**: support@africastalking.com
- **Documentation**: See WHATSAPP_GUIDE.md

---

**That's it!** Your farmers can now send plant photos via WhatsApp for instant AI diagnosis. 🎉
