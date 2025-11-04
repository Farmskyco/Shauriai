# AI Audio Agronomic Chatbot for Kenyan Farmers

A toll-free AI-powered voice chatbot that provides 24/7 agronomic advisory services to Kenyan farmers in multiple local languages (English, Swahili, Luo, and Kikuyu).

## Features

1. **24/7 Audio Agronomic Advisory**
   - Market prices and trends
   - Weather information and forecasts
   - Crop-specific advice (planting, fertilization, pest control)
   - Location-based recommendations

2. **Voice-Activated E-commerce**
   - Order farm inputs (fertilizers, pesticides, seeds)
   - Voice-based product search
   - Order confirmation via SMS

3. **Post-Call SMS Summary**
   - Automatic conversation summary
   - Order details and receipts
   - Follow-up information

4. **Multi-Language Support**
   - English
   - Swahili
   - Luo
   - Kikuyu

## Technology Stack

### Core Services
- **Telephony**: Africa's Talking Voice & SMS API
- **AI**: Claude API (Anthropic) for natural language understanding
- **Speech-to-Text**: Azure Cognitive Services
- **Text-to-Speech**: Azure Cognitive Services
- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL
- **Cache**: Redis

### External APIs
- **Weather**: OpenWeather API
- **Payment**: M-Pesa API (Safaricom)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Africa's Talking account with:
  - Voice API access
  - SMS API access
  - Toll-free number
- Anthropic API key
- Azure Cognitive Services account
- OpenWeather API key

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Shauriai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agronomic_chatbot
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379

# Africa's Talking
AT_USERNAME=your_username
AT_API_KEY=your_api_key
AT_SHORT_CODE=your_short_code

# Claude AI
ANTHROPIC_API_KEY=your_anthropic_key

# Azure Speech
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=eastus

# Weather
OPENWEATHER_API_KEY=your_weather_key

# M-Pesa
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_ENVIRONMENT=sandbox

# Application
BASE_URL=https://your-domain.com
WEBHOOK_URL=https://your-domain.com/webhooks/at
```

### 4. Set up the database

Create PostgreSQL database:

```bash
createdb agronomic_chatbot
```

Run migrations:

```bash
npm run migrate
```

Seed with sample data:

```bash
ts-node src/database/seed.ts
```

### 5. Start the development server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Production Deployment

### 1. Build the application

```bash
npm run build
```

### 2. Start the production server

```bash
npm start
```

### 3. Set up Africa's Talking Webhooks

In your Africa's Talking dashboard:

1. Go to Voice > Settings
2. Set the callback URL to: `https://your-domain.com/webhooks/at/voice`
3. Enable voice recording
4. Configure your toll-free number

### 4. Deploy with Docker (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t agronomic-chatbot .
docker run -p 3000:3000 --env-file .env agronomic-chatbot
```

## System Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design and component descriptions.

## Call Flow

1. **Farmer calls toll-free number**
   - Africa's Talking webhook triggers `/webhooks/at/voice`

2. **Language selection (IVR)**
   - Press 1 for English
   - Press 2 for Swahili
   - Press 3 for Luo
   - Press 4 for Kikuyu

3. **Main menu (IVR)**
   - Press 1 for farming advice
   - Press 2 to buy farm inputs
   - Press 0 to speak your question

4. **Voice interaction**
   - Farmer speaks their question
   - System records audio
   - STT converts to text
   - Claude AI processes query
   - TTS converts response to audio
   - Audio played back to farmer

5. **Post-call processing**
   - Conversation summary generated
   - SMS sent to farmer
   - Order confirmations (if any)

## API Endpoints

### Webhooks (Africa's Talking)

- `POST /webhooks/at/voice` - Incoming call handler
- `POST /webhooks/at/language-selected` - Language selection callback
- `POST /webhooks/at/menu-selected` - Menu selection callback
- `POST /webhooks/at/recording-complete` - Recording processing
- `POST /webhooks/at/continue-conversation` - Continue/end call

### Health Check

- `GET /webhooks/health` - System health check
- `GET /` - API information

## Configuration for Kenya

### Supported Counties

The system can provide location-specific advice for all 47 Kenyan counties. Weather data is fetched from OpenWeather API for major towns in each county.

### Common Kenyan Crops

Pre-configured knowledge base includes:
- Maize (Mahindi)
- Beans (Maharagwe)
- Potatoes (Viazi)
- Tomatoes (Nyanya)
- Coffee (Kahawa)
- Tea (Chai)

### Available Fertilizers

Seeded with common fertilizers:
- DAP (18-46-0)
- CAN (26-0-0)
- NPK 17:17:17
- NPK 23:23:0
- Urea (46-0-0)

## Monitoring & Logs

Logs are stored in the `logs/` directory:
- `application-YYYY-MM-DD.log` - General application logs
- `error-YYYY-MM-DD.log` - Error logs

Logs are rotated daily and retained for 14 days (errors for 30 days).

## Cost Optimization

1. **Africa's Talking**: Pay-per-use (calls + SMS)
   - Estimate: ~KES 2-5 per minute for toll-free calls
   - SMS: ~KES 0.80 per SMS

2. **Claude API**: Token-based pricing
   - Cache similar queries in Redis
   - Optimize prompts for shorter responses

3. **Azure Speech**: Pay-per-use
   - Cache common TTS responses
   - Standard tier sufficient for Kenya

4. **Infrastructure**: VPS or cloud hosting
   - Recommended: 2 CPU, 4GB RAM
   - Cost: ~$20-40/month

## Scaling Considerations

- **100+ concurrent calls**: Use multiple server instances behind a load balancer
- **Redis**: For session management and caching
- **PostgreSQL**: Primary + read replicas for high traffic
- **CDN**: For static audio files (IVR prompts)

## Troubleshooting

### Audio not playing

- Check that audio files are publicly accessible
- Verify BASE_URL is correct in .env
- Ensure audio_cache directory has proper permissions

### Speech recognition issues

- Verify Azure Speech credentials
- Check language codes match Azure's supported languages
- Review audio quality from Africa's Talking

### Database connection errors

- Confirm PostgreSQL is running
- Check DB credentials in .env
- Verify database exists

## Support & Contributions

For issues and feature requests, please create an issue in the repository.

## License

MIT License

## Acknowledgments

- Africa's Talking for telephony infrastructure
- Anthropic for Claude AI
- Azure Cognitive Services for speech processing
