# 🔐 API Keys Configuration Guide

## ✅ Keys Configured

Your API keys have been securely added to `.env` file:

### 1. Africa's Talking ✅
- **Username**: `farmbot`
- **API Key**: `atsk_398...f9a2290d7` (secured in .env)
- **Phone Number**: `+254711082209`

### 2. Claude AI (Anthropic) ✅
- **API Key**: `sk-ant-api03-...` (secured in .env)
- **Access**: Claude 3.5 Sonnet with Vision

### 3. OpenWeather API ✅
- **App Name**: `shauriai`
- **API Key**: `f43c38fc...2d148c15` (secured in .env)

---

## 🚀 Next Steps - Complete Setup

### Step 1: Get Your Public URL

You need a public HTTPS URL for Africa's Talking webhooks.

**Option A: Production Server**
```bash
# Your domain (e.g., farmbot.yourdomain.com)
BASE_URL=https://farmbot.yourdomain.com
```

**Option B: Development with ngrok** (Recommended for Testing)
```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start your server
npm run dev

# In another terminal, create tunnel
ngrok http 3000

# ngrok will give you a URL like:
# https://abc123.ngrok.io
```

### Step 2: Update .env with Your URL

Edit `.env` file and replace `your-domain.com` with your actual URL:

```bash
# If using ngrok
BASE_URL=https://abc123.ngrok.io
WEBHOOK_URL=https://abc123.ngrok.io/webhooks/at
WHATSAPP_WEBHOOK_URL=https://abc123.ngrok.io/whatsapp/incoming

# If using your own domain
BASE_URL=https://farmbot.yourdomain.com
WEBHOOK_URL=https://farmbot.yourdomain.com/webhooks/at
WHATSAPP_WEBHOOK_URL=https://farmbot.yourdomain.com/whatsapp/incoming
```

### Step 3: Set Up Database

```bash
# Make sure PostgreSQL is running
sudo systemctl start postgresql  # Linux
# or
brew services start postgresql   # macOS

# Create database
createdb agronomic_chatbot

# Update DB_PASSWORD in .env with your PostgreSQL password
nano .env
# Change: DB_PASSWORD=your_postgres_password_here

# Run migrations
npm run migrate

# Seed products
ts-node src/database/seed.ts
```

### Step 4: Start Server

```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Server will run on http://localhost:3000
```

---

## 📱 Africa's Talking Configuration

### Voice Call Setup (For Toll-Free Calls)

1. **Login to Africa's Talking Dashboard**
   - Go to: https://account.africastalking.com/apps/farmbot

2. **Navigate to Voice Section**
   - Click: **Voice** → **Settings**

3. **Configure Voice Callback URL**
   ```
   URL: https://YOUR-DOMAIN/webhooks/at/voice

   Example with ngrok:
   https://abc123.ngrok.io/webhooks/at/voice

   Example with domain:
   https://farmbot.yourdomain.com/webhooks/at/voice
   ```

4. **Additional Voice Settings**
   - ✅ Enable Recording
   - ✅ Set Recording Callback URL: `https://YOUR-DOMAIN/webhooks/at/recording-complete`

5. **Save Configuration**

6. **Request Toll-Free Number** (if you don't have one)
   - Go to: **Voice** → **Numbers**
   - Click: **Request Number**
   - Select: **Toll-Free**
   - Country: **Kenya**
   - Submit request (takes 2-5 business days)

---

### WhatsApp Setup (For Disease Detection)

1. **Login to Africa's Talking Dashboard**
   - Go to: https://account.africastalking.com/apps/farmbot

2. **Navigate to WhatsApp Section**
   - Click: **WhatsApp** → **Settings**

3. **Apply for WhatsApp Business API**
   - If not yet approved, click **"Apply for WhatsApp Business API"**
   - Fill in business details
   - Wait for approval (1-2 weeks)

4. **Configure WhatsApp Webhook** (Once Approved)
   ```
   URL: https://YOUR-DOMAIN/whatsapp/incoming

   Example with ngrok:
   https://abc123.ngrok.io/whatsapp/incoming

   Example with domain:
   https://farmbot.yourdomain.com/whatsapp/incoming
   ```

5. **Enable Image Receiving**
   - ✅ Check: **"Receive Images"**
   - ✅ Check: **"Receive Documents"**

6. **Save Configuration**

---

## 🧪 Testing URLs

### Local Testing (No Africa's Talking needed)

```bash
# Test server status
curl http://localhost:3000/

# Expected response:
{
  "service": "Agronomic Chatbot API",
  "version": "2.0.0",
  "status": "running",
  "features": [...]
}

# Test voice webhook health
curl http://localhost:3000/webhooks/health

# Test WhatsApp webhook (should return 200 or 500)
curl -X POST http://localhost:3000/whatsapp/incoming \
  -H "Content-Type: application/json" \
  -d '{"from": "+254712345678", "text": "Hi"}'
```

### With Africa's Talking (After Configuration)

**Test Voice Calls:**
1. Call your Africa's Talking number: **+254711082209**
2. Should hear IVR menu
3. Select language
4. Speak your question
5. Get AI response

**Test WhatsApp:**
1. Add **+254711082209** to your contacts
2. Message on WhatsApp: "Hi"
3. Should receive welcome menu
4. Send a plant photo
5. Get AI diagnosis

---

## 🔍 Verification Checklist

Run the system check script:

```bash
# Make script executable
chmod +x scripts/check-system.sh

# Run system check
./scripts/check-system.sh

# Or with your URL
./scripts/check-system.sh https://your-domain.com
```

Expected output:
```
✓ Server is running
✓ Voice webhook endpoint is accessible
✓ WhatsApp webhook endpoint is accessible
✓ Database is accessible
✓ Redis is running
```

---

## 🔐 Security Notes

### ⚠️ IMPORTANT: Protect Your Keys

1. **Never commit .env to Git**
   ```bash
   # .env is already in .gitignore
   git status  # should NOT show .env
   ```

2. **Use Environment Variables in Production**
   ```bash
   # Set via server environment, not files
   export ANTHROPIC_API_KEY="sk-ant-..."
   export AT_API_KEY="atsk_..."
   ```

3. **Restrict File Permissions**
   ```bash
   chmod 600 .env
   ```

4. **Rotate Keys Regularly**
   - Change keys every 90 days
   - Revoke old keys immediately

---

## 📋 Quick Reference - URLs to Configure

### In Africa's Talking Dashboard:

**Replace `YOUR-DOMAIN` with your actual URL**

| Setting | URL to Paste |
|---------|--------------|
| Voice Callback URL | `https://YOUR-DOMAIN/webhooks/at/voice` |
| Recording Callback | `https://YOUR-DOMAIN/webhooks/at/recording-complete` |
| WhatsApp Incoming | `https://YOUR-DOMAIN/whatsapp/incoming` |

**Example with ngrok:**
- Voice: `https://abc123.ngrok.io/webhooks/at/voice`
- WhatsApp: `https://abc123.ngrok.io/whatsapp/incoming`

**Example with domain:**
- Voice: `https://farmbot.yourdomain.com/webhooks/at/voice`
- WhatsApp: `https://farmbot.yourdomain.com/whatsapp/incoming`

---

## 🚨 Troubleshooting

### Issue: "Cannot connect to database"
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -l | grep agronomic_chatbot

# Create if missing
createdb agronomic_chatbot
```

### Issue: "Redis connection failed"
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if needed
sudo systemctl start redis
```

### Issue: "Webhooks not receiving calls"
- ✅ Verify URL is HTTPS (not HTTP)
- ✅ Check URL is publicly accessible
- ✅ Test with curl from external server
- ✅ Check Africa's Talking webhook logs

### Issue: "Image analysis fails"
- ✅ Verify Claude API key has Vision access
- ✅ Check image size < 5MB
- ✅ Verify image format (JPEG, PNG)

---

## 📞 Support

### Africa's Talking Support
- **Email**: support@africastalking.com
- **Phone**: +254 20 521 7176
- **Dashboard**: https://account.africastalking.com

### Check Logs
```bash
# View server logs
pm2 logs agronomic-chatbot

# Or if using npm run dev
# Logs appear in terminal

# Check application logs
tail -f logs/application-*.log

# Check error logs
tail -f logs/error-*.log
```

---

## ✅ Setup Complete!

Once you've:
1. ✅ Updated BASE_URL in .env
2. ✅ Set up database (PostgreSQL)
3. ✅ Started server (`npm run dev`)
4. ✅ Configured Africa's Talking webhooks
5. ✅ Tested with phone call and WhatsApp

**You're ready to serve farmers!** 🎉

---

**Next Step**: Update `.env` with your public URL, then configure Africa's Talking webhooks.
