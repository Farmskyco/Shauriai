#!/bin/bash

# Quick Setup Script - Configure with your actual domain

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Agronomic Chatbot - Africa's Talking Setup          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "   Please create .env file first"
    exit 1
fi

# Get BASE_URL from .env
BASE_URL=$(grep "^BASE_URL=" .env | cut -d '=' -f2)

if [ "$BASE_URL" == "https://your-domain.com" ]; then
    echo "⚠️  Warning: BASE_URL not configured in .env"
    echo ""
    echo "Please update .env file with your actual domain:"
    echo ""
    echo "Option 1: Using ngrok (for testing)"
    echo "  1. Run: ngrok http 3000"
    echo "  2. Copy the https URL (e.g., https://abc123.ngrok.io)"
    echo "  3. Update .env:"
    echo "     BASE_URL=https://abc123.ngrok.io"
    echo "     WEBHOOK_URL=https://abc123.ngrok.io/webhooks/at"
    echo "     WHATSAPP_WEBHOOK_URL=https://abc123.ngrok.io/whatsapp/incoming"
    echo ""
    echo "Option 2: Using your domain"
    echo "  1. Update .env:"
    echo "     BASE_URL=https://farmbot.yourdomain.com"
    echo "     WEBHOOK_URL=https://farmbot.yourdomain.com/webhooks/at"
    echo "     WHATSAPP_WEBHOOK_URL=https://farmbot.yourdomain.com/whatsapp/incoming"
    echo ""
    exit 1
fi

echo "✅ Configuration detected:"
echo "   BASE_URL: $BASE_URL"
echo ""

# Generate URLs
VOICE_URL="${BASE_URL}/webhooks/at/voice"
RECORDING_URL="${BASE_URL}/webhooks/at/recording-complete"
WHATSAPP_URL="${BASE_URL}/whatsapp/incoming"

echo "════════════════════════════════════════════════════════"
echo "COPY THESE URLS TO AFRICA'S TALKING DASHBOARD"
echo "════════════════════════════════════════════════════════"
echo ""

echo "📞 VOICE CALL SETUP"
echo "────────────────────────────────────────────────────────"
echo "1. Go to: https://account.africastalking.com/apps/farmbot"
echo "2. Click: Voice → Settings"
echo "3. Paste this URL in 'Callback URL':"
echo ""
echo "   $VOICE_URL"
echo ""
echo "4. Enable Recording"
echo "5. Paste this URL in 'Recording Callback URL':"
echo ""
echo "   $RECORDING_URL"
echo ""
echo "6. Click 'Save'"
echo ""

echo "📱 WHATSAPP SETUP"
echo "────────────────────────────────────────────────────────"
echo "1. Go to: https://account.africastalking.com/apps/farmbot"
echo "2. Click: WhatsApp → Settings"
echo "3. If not approved, click 'Apply for WhatsApp Business API'"
echo "4. Once approved, paste this URL in 'Webhook URL':"
echo ""
echo "   $WHATSAPP_URL"
echo ""
echo "5. Enable: ✓ Receive Images"
echo "6. Enable: ✓ Receive Documents"
echo "7. Click 'Save'"
echo ""

echo "════════════════════════════════════════════════════════"
echo "TESTING"
echo "════════════════════════════════════════════════════════"
echo ""
echo "After configuring Africa's Talking:"
echo ""
echo "📞 Test Voice Call:"
echo "   Call: +254711082209"
echo "   → Should hear IVR menu"
echo "   → Select language"
echo "   → Ask a question"
echo ""
echo "📱 Test WhatsApp:"
echo "   Message: +254711082209"
echo "   Send: 'Hi'"
echo "   → Should get welcome menu"
echo "   → Send plant photo"
echo "   → Should get AI diagnosis"
echo ""

echo "════════════════════════════════════════════════════════"
echo "QUICK COMMANDS"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Start server:        npm run dev"
echo "Check database:      psql agronomic_chatbot"
echo "Check Redis:         redis-cli ping"
echo "View logs:           tail -f logs/application-*.log"
echo "System check:        ./scripts/check-system.sh"
echo ""

echo "Need help? See: API_KEYS_SETUP.md"
echo ""
