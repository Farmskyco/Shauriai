# AI Audio Agronomic Chatbot - System Architecture

## Overview
Toll-free AI audio chatbot providing 24/7 agronomic advisory to Kenyan farmers in multiple local languages (English, Swahili, Luo, Kikuyu).

## System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Farmer (Phone Call)                         │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Africa's Talking (AT)                          │
│  - Toll-free number                                                 │
│  - Voice API (IVR)                                                  │
│  - SMS API                                                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Application Server (Node.js)                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Call Handler                                                 │ │
│  │  - Webhook endpoints for AT                                   │ │
│  │  - Session management                                         │ │
│  │  - State machine for conversation flow                        │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Speech Processing Pipeline                                   │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │ │
│  │  │  STT Service│→ │  AI Agent    │→ │  TTS Service       │  │ │
│  │  │  (Azure/GCP)│  │  (Claude)    │  │  (Azure/Google)    │  │ │
│  │  └─────────────┘  └──────────────┘  └────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Knowledge Base Services                                      │ │
│  │  - Agronomic data (crop info, best practices)                 │ │
│  │  - Weather API integration                                    │ │
│  │  - Market price data                                          │ │
│  │  - Location-based recommendations                             │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  E-commerce Agent                                             │ │
│  │  - Product catalog (fertilizers, inputs)                      │ │
│  │  - Order processing                                           │ │
│  │  - Payment integration (M-Pesa)                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  SMS Service                                                  │ │
│  │  - Call summary generation                                    │ │
│  │  - SMS delivery via Africa's Talking                          │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                            │
│  - User profiles                                                    │
│  - Call sessions                                                    │
│  - Conversation history                                             │
│  - Orders                                                           │
│  - Analytics                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Call Flow

1. **Incoming Call**
   - Farmer dials toll-free number
   - Africa's Talking receives call → webhook to our server

2. **Language Selection**
   - IVR: "Press 1 for English, 2 for Swahili, 3 for Luo, 4 for Kikuyu"
   - Store language preference in session

3. **Main Menu**
   - IVR options:
     - "Press 1 for agronomic advisory"
     - "Press 2 to buy farm inputs"
     - "Press 0 to speak your question"

4. **Speech Interaction Loop**
   - Record farmer's audio
   - STT → Convert to text (language-specific)
   - Claude AI → Process query, get context from knowledge base
   - TTS → Convert response to speech (language-specific)
   - Play response to farmer
   - Repeat until farmer hangs up

5. **Post-Call**
   - Generate conversation summary
   - Send SMS to farmer with summary and any order details

## Technology Stack

### Telephony & SMS
- **Africa's Talking Voice API**
  - Toll-free number setup
  - IVR capabilities
  - Voice recording
  - Audio playback
- **Africa's Talking SMS API**
  - Post-call summaries
  - Order confirmations

### Speech Processing
- **Speech-to-Text**: Azure Speech Services or Google Cloud Speech-to-Text
  - Swahili: Supported natively
  - English: Supported natively
  - Luo & Kikuyu: May need custom models or fallback to Swahili

- **Text-to-Speech**: Azure Speech Services or Google Cloud TTS
  - High-quality neural voices
  - Multi-language support

### AI & NLP
- **Claude API (Anthropic)**
  - Agricultural knowledge
  - Natural conversation
  - Intent classification
  - Entity extraction
  - Multi-language understanding

### Backend
- **Node.js + TypeScript**
  - Express.js for API
  - Async/await for speech processing
  - WebSocket for real-time updates

### Database
- **PostgreSQL**
  - User data
  - Session management
  - Conversation logs
  - Order history

### External APIs
- **Weather**: OpenWeather API or local Kenyan weather service
- **Market Prices**: Kenya National Farmers Information Service (NAFIS) or custom scraping
- **Payment**: M-Pesa API for transactions

## Data Models

### User
- id, phone_number, preferred_language, location, created_at

### CallSession
- id, user_id, session_id, language, status, started_at, ended_at

### Conversation
- id, session_id, role (user/assistant), content, audio_url, timestamp

### Order
- id, session_id, user_id, product_id, quantity, total_price, payment_status

### Product
- id, name, category, price, description, stock_quantity

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Load Balancer (Nginx/Caddy)                                    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Application Server (Node.js)                                   │
│  - Docker containers                                            │
│  - Auto-scaling based on call volume                            │
│  - Health checks                                                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                            │
│  - Primary + Read replicas                                      │
│  - Automated backups                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Security Considerations

1. **Data Privacy**
   - Encrypt voice recordings at rest
   - GDPR/data protection compliance
   - Secure API keys in environment variables

2. **Authentication**
   - Phone number verification
   - Webhook signature verification from Africa's Talking

3. **Rate Limiting**
   - Prevent abuse
   - DDoS protection

## Scalability

1. **Concurrent Calls**: Design for 100+ simultaneous calls
2. **Caching**: Redis for frequently accessed data (market prices, weather)
3. **Queue System**: Bull/Redis for background jobs (SMS sending, analytics)
4. **CDN**: For static audio files (IVR prompts)

## Monitoring & Analytics

1. **Metrics**
   - Call volume
   - Average call duration
   - Language distribution
   - Query types
   - Order conversion rates

2. **Logging**
   - Winston for application logs
   - Call recordings for quality assurance
   - Error tracking (Sentry)

## Cost Optimization

1. **Africa's Talking**: Pay-per-minute for calls, per-SMS
2. **STT/TTS**: Batch processing, caching common responses
3. **Claude API**: Optimize prompts, cache similar queries
4. **Database**: Implement data retention policies
