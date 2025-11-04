# WhatsApp Plant Disease Detection Guide

## Overview

The WhatsApp integration adds powerful plant disease detection capabilities to the agronomic chatbot. Farmers can simply send a photo of their plant to get instant AI-powered diagnosis, treatment recommendations, and purchase farm inputs directly through WhatsApp.

---

## Features

### 1. 📸 AI-Powered Plant Disease Detection
- **Image Analysis**: Uses Claude 3.5 Sonnet Vision API for accurate plant analysis
- **Multi-Disease Detection**: Identifies multiple diseases and deficiencies simultaneously
- **Confidence Scoring**: Provides confidence levels for diagnoses
- **Comprehensive Reports**: Detailed analysis of plant health

### 2. 🔬 Diagnosis Capabilities
- **Common Kenyan Plant Diseases**:
  - Late Blight (Potatoes, Tomatoes)
  - Coffee Berry Disease
  - Maize Streak Virus
  - Bacterial Wilt
  - Fall Armyworm
  - Powdery Mildew
  - Aphid Infestations

- **Nutrient Deficiencies**:
  - Nitrogen (N)
  - Phosphorus (P)
  - Potassium (K)
  - Iron (Fe)
  - Magnesium (Mg)
  - Calcium (Ca)
  - Zinc (Zn)

### 3. 💊 Treatment Recommendations
- Specific treatment steps
- Application methods
- Timing recommendations
- Prevention strategies
- Product recommendations

### 4. 🛒 Integrated E-commerce
- **Direct Purchase**: Buy recommended products via WhatsApp
- **Product Catalog**: Browse fertilizers and pesticides
- **Order Management**: Track orders through WhatsApp
- **M-Pesa Payment**: Seamless mobile money integration

### 5. 🌍 Multi-Language Support
- **English**: Full support
- **Swahili**: Complete translations
- **Luo**: Interface and responses
- **Kikuyu**: Interface and responses

### 6. 🤖 AI Farming Assistant
- Ask any farming question
- Get weather updates
- Market price information
- Crop-specific advice
- Location-based recommendations

---

## How It Works

### User Flow

```
1. Farmer sends "Hi" to WhatsApp Business number
   ↓
2. Bot sends welcome message with menu options
   ↓
3. Farmer selects option or sends plant photo
   ↓
4. Image Analysis Process:
   • Download image from WhatsApp
   • Optimize image for analysis
   • Claude Vision API analyzes image
   • Extract diseases and deficiencies
   • Match with knowledge base
   • Generate recommendations
   ↓
5. Send diagnosis report to farmer
   ↓
6. Offer product recommendations
   ↓
7. Farmer can purchase products
   ↓
8. Complete checkout via WhatsApp
   ↓
9. Send payment instructions (M-Pesa)
   ↓
10. Farmer pays and receives confirmation
```

### Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WhatsApp User                            │
│         (Sends photo via WhatsApp Business)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Africa's Talking WhatsApp API                  │
│  - Receives message                                         │
│  - Extracts image URL                                       │
│  - Sends webhook to our server                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Application Server                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  WhatsApp Controller                                  │ │
│  │  - Session management                                 │ │
│  │  - State handling                                     │ │
│  │  - Message routing                                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Image Analysis Service                               │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ 1. Download image from WhatsApp                 │ │ │
│  │  │ 2. Optimize with Sharp                          │ │ │
│  │  │ 3. Convert to base64                            │ │ │
│  │  │ 4. Send to Claude Vision API                    │ │ │
│  │  │ 5. Parse AI response                            │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Disease Knowledge Base                               │ │
│  │  - Match detected diseases                            │ │
│  │  - Enhance recommendations                            │ │
│  │  - Suggest products                                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  E-commerce Service                                   │ │
│  │  - Product search                                     │ │
│  │  - Order creation                                     │ │
│  │  - Payment processing                                 │ │
│  └───────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database                                 │
│  - User profiles                                            │
│  - WhatsApp sessions                                        │
│  - Plant analyses                                           │
│  - Orders                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### Prerequisites

1. **Africa's Talking WhatsApp Business Account**
   - Sign up at [africastalking.com](https://africastalking.com)
   - Request WhatsApp Business API access
   - Get your API key and username

2. **Anthropic Claude API**
   - Sign up at [console.anthropic.com](https://console.anthropic.com)
   - Generate API key
   - Ensure access to Claude 3.5 Sonnet with vision

3. **Server with Public URL**
   - HTTPS enabled (required for WhatsApp webhooks)
   - Sufficient storage for images

### Step 1: Configure Africa's Talking

1. **Login to Dashboard**
   - Navigate to [dashboard.africastalking.com](https://dashboard.africastalking.com)

2. **Enable WhatsApp**
   - Go to **WhatsApp** section
   - Apply for WhatsApp Business API access
   - Wait for approval (usually 1-2 weeks)

3. **Get WhatsApp Number**
   - Once approved, you'll receive a WhatsApp Business number
   - Note down the number

4. **Configure Webhook**
   - Set webhook URL: `https://your-domain.com/whatsapp/incoming`
   - Enable image receiving
   - Save configuration

### Step 2: Update Environment Variables

Add to your `.env` file:

```bash
# WhatsApp Configuration
WHATSAPP_WEBHOOK_URL=https://your-domain.com/whatsapp/incoming
AT_WHATSAPP_NUMBER=+254700000000  # Your WhatsApp Business number

# Ensure these are set
ANTHROPIC_API_KEY=sk-ant-xxxxx
BASE_URL=https://your-domain.com
```

### Step 3: Database Migration

Run migration to create WhatsApp tables:

```bash
npm run migrate
```

This creates:
- `whatsapp_sessions` table
- `plant_analyses` table

### Step 4: Test Setup

```bash
# Start server
npm run dev

# Test webhook endpoint
curl https://your-domain.com/whatsapp/incoming

# Should return 200 OK
```

### Step 5: Test with WhatsApp

1. **Send test message** to your WhatsApp Business number
2. **You should receive** welcome message
3. **Send a plant photo**
4. **Receive** diagnosis within 10-15 seconds

---

## Usage Examples

### Example 1: Disease Detection

**Farmer**: Sends photo of tomato plant with brown spots

**Bot Response**:
```
🔬 Analysis Results

🦠 Detected Disease:
• Late Blight

🌿 Nutrient Deficiency:
• None detected

📊 Confidence: 92%

💡 Recommendations:
• Apply Mancozeb fungicide immediately
• Remove and destroy infected leaves
• Avoid overhead irrigation
• Improve air circulation
• Apply preventive fungicides weekly

🛒 Recommended Products:
1. Mancozeb 80% WP - KES 1,200
2. Ridomil Gold - KES 1,800
3. Copper Oxychloride - KES 950
```

**Bot**: "Would you like to purchase any of these products?"

**Farmer**: Selects "Mancozeb"

**Bot**: "How many bags would you like to buy?"

**Farmer**: "2"

**Bot**:
```
✅ Order Confirmed!
Product: Mancozeb 80% WP
Quantity: 2 bags
Total: KES 2,400

💳 Payment Instructions:
Send KES 2,400 to M-Pesa: 0700 000 000
Reference: ABC12345

After payment, you'll receive confirmation.
```

### Example 2: Nutrient Deficiency

**Farmer**: Sends photo of maize with yellow leaves

**Bot Response**:
```
🔬 Analysis Results

🦠 Detected Disease:
• None

🌿 Nutrient Deficiency:
• Nitrogen deficiency

📊 Confidence: 88%

💡 Recommendations:
• Apply nitrogen fertilizers immediately
• Use Urea (46-0-0) or CAN (26-0-0)
• Apply 50kg per acre
• Water after application
• Repeat in 3-4 weeks if needed

🛒 Recommended Products:
1. Urea (46-0-0) - KES 3,500 per 50kg
2. CAN (26-0-0) - KES 3,800 per 50kg
```

### Example 3: General Farming Question

**Farmer**: "When should I plant maize in Nakuru?"

**Bot Response**:
```
🌾 Maize Planting in Nakuru

Best planting times:
• Long rains: March to April
• Short rains: October to November

Current recommendation:
[Based on weather data]
• Wait for consistent rainfall (50mm+)
• Soil should be moist 15cm deep
• Temperature: 18-27°C optimal

Weather forecast for Nakuru:
🌤️ Temperature: 22°C
💧 Rainfall expected next week
✅ Good time to prepare for planting!
```

### Example 4: Weather Request

**Farmer**: "Weather in Kisumu"

**Bot Response**:
```
🌤️ Weather - Kisumu

🌡️ Temperature: 26°C
📝 Conditions: Partly cloudy
💧 Humidity: 75%
💨 Wind: 3.2 m/s

💡 Farming Advice:
Good conditions for planting.
Ensure irrigation is available.
```

---

## WhatsApp Message Types

### 1. Text Messages
- Simple text responses
- Menu navigation
- Questions and answers

### 2. Image Messages
- Plant photos for analysis
- Automatically triggers disease detection
- Saved to database for future reference

### 3. Interactive Buttons
- Product selection (max 3 buttons)
- Quick replies
- Menu options

### 4. List Messages
- Product catalog
- Multiple product selection
- Organized by categories

---

## Language Support

### Automatic Language Detection

The system detects user language based on:
1. User's profile preference
2. Previous interactions
3. Keywords in message

### Supported Languages

**English**
```
Welcome to AgriAdvice!
I can help you with:
1. Disease Detection
2. Farming Advice
3. Buy Inputs
4. Weather Updates
```

**Swahili**
```
Karibu AgriAdvice!
Ninaweza kukusaidia na:
1. Utambuzi wa Magonjwa
2. Ushauri wa Kilimo
3. Nunua Pembejeo
4. Habari za Hali ya Hewa
```

**Luo**
```
Welcome to AgriAdvice!
Anyalo konyi gi:
1. Disease Detection
2. Farming Advice
3. Buy Inputs
4. Weather Updates
```

**Kikuyu**
```
Wamũkĩra AgriAdvice!
Ndĩngĩhota gũgũteithia na:
1. Kũmenya Mĩrimũ
2. Kĩrĩra kĩa Ũrĩmi
3. Gũra Mbegũ
4. Ũhoro wa Mbura
```

---

## API Reference

### WhatsApp Webhook

**Endpoint**: `POST /whatsapp/incoming`

**Request Body** (from Africa's Talking):
```json
{
  "from": "+254712345678",
  "to": "+254700000000",
  "text": "User message",
  "image": "https://media.africastalking.com/image.jpg",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Response**: `200 OK`

### Image Analysis

Images are automatically:
1. Downloaded from WhatsApp CDN
2. Optimized (max 1024x1024, 85% quality)
3. Converted to base64
4. Sent to Claude Vision API
5. Analyzed for diseases and deficiencies
6. Results stored in database

### Session Management

Sessions stored in Redis:
- **Key**: `whatsapp_session:{phoneNumber}`
- **TTL**: 3600 seconds (1 hour)
- **Data**: User state, context, language preference

---

## Database Schema

### whatsapp_sessions
```sql
CREATE TABLE whatsapp_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  phone_number VARCHAR NOT NULL,
  language VARCHAR(10) NOT NULL,
  state VARCHAR(50) NOT NULL,
  context JSONB DEFAULT '{}',
  last_activity_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### plant_analyses
```sql
CREATE TABLE plant_analyses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  whatsapp_session_id UUID,
  image_url VARCHAR NOT NULL,
  analysis_result JSONB NOT NULL,
  detected_diseases TEXT[],
  detected_deficiencies TEXT[],
  confidence FLOAT,
  recommendations TEXT[],
  recommended_products TEXT[],
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Cost Estimation

### Per Analysis Cost

| Service | Cost |
|---------|------|
| WhatsApp message (incoming) | Free |
| WhatsApp message (outgoing) | $0.005 (KES 0.65) |
| Claude Vision API | $0.015 per image |
| Image storage (100MB) | $0.023/month |
| **Total per analysis** | **~KES 2-3** |

### Monthly Estimates

**100 analyses/month**: KES 200-300
**1,000 analyses/month**: KES 2,000-3,000
**10,000 analyses/month**: KES 20,000-30,000

*Plus infrastructure costs (server, database)*

---

## Best Practices

### For Farmers

1. **Photo Quality**:
   - Take photos in good lighting
   - Focus on affected areas
   - Include entire plant if possible
   - Avoid blurry images

2. **Timing**:
   - Take photos early morning or late afternoon
   - Avoid harsh midday sun
   - Ensure symptoms are visible

3. **Context**:
   - Mention crop type if unclear
   - Describe symptoms
   - Share location for better advice

### For Administrators

1. **Monitoring**:
   - Track analysis accuracy
   - Monitor user feedback
   - Review misdiagnoses

2. **Knowledge Base**:
   - Regularly update disease database
   - Add new products
   - Update prices

3. **Performance**:
   - Monitor API response times
   - Optimize image processing
   - Cache common analyses

---

## Troubleshooting

### Image Analysis Fails

**Problem**: "Failed to analyze image"

**Solutions**:
- Check Claude API key validity
- Verify API quota hasn't been exceeded
- Ensure image format is supported (JPEG, PNG)
- Check image file size (< 5MB)

### WhatsApp Messages Not Received

**Problem**: Bot doesn't respond

**Solutions**:
- Verify webhook URL is correct
- Check server is running and accessible
- Ensure HTTPS is properly configured
- Check Africa's Talking webhook logs

### Slow Response Times

**Problem**: Takes too long to get diagnosis

**Solutions**:
- Optimize image before sending to API
- Implement response caching
- Use faster server instance
- Enable CDN for image downloads

---

## Future Enhancements

### Planned Features

1. **Video Analysis**: Support for video uploads
2. **Voice Messages**: Voice-based queries
3. **Group Support**: Farmers can add bot to groups
4. **Pest Identification**: Enhanced pest detection
5. **Crop Stages**: Growth stage tracking
6. **Historical Analysis**: Track plant health over time
7. **Weather Alerts**: Proactive notifications
8. **Price Alerts**: Market price notifications

### AI Improvements

1. **Fine-tuning**: Train on Kenya-specific data
2. **Multiple Crops**: Expand crop coverage
3. **Seasonal Adaptation**: Season-specific advice
4. **Soil Analysis**: Integrate soil test results

---

## Support

### For Technical Issues
- **Email**: support@yourdomain.com
- **GitHub**: Create an issue
- **Documentation**: See README.md

### For WhatsApp Setup
- **Africa's Talking**: support@africastalking.com
- **Phone**: +254 20 521 7176

### For API Issues
- **Anthropic**: support@anthropic.com
- **Documentation**: [docs.anthropic.com](https://docs.anthropic.com)

---

## Compliance & Privacy

### Data Protection

- User images stored securely
- GDPR/Kenya Data Protection Act compliance
- User consent obtained
- Data deletion on request
- Encrypted storage

### Terms of Service

- Clear terms in local languages
- Privacy policy accessible
- Opt-out mechanisms
- Data retention policies

---

**Version**: 2.0.0
**Last Updated**: January 2025
**Maintainer**: AgriAdvice Team
