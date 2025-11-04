# Quick Start Guide

Get the AI Agronomic Chatbot running in 15 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Git

## 5-Minute Local Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd Shauriai
npm install
```

### 2. Start Dependencies

**PostgreSQL:**
```bash
# Create database
createdb agronomic_chatbot
```

**Redis:**
```bash
# Start Redis (if not running)
redis-server
```

### 3. Configure Environment

```bash
cp .env.example .env
```

**Minimum required configuration** for local testing:

```env
# Database
DB_NAME=agronomic_chatbot
DB_USER=postgres
DB_PASSWORD=your_password

# Just for testing - use free tier keys
ANTHROPIC_API_KEY=sk-ant-xxx
AZURE_SPEECH_KEY=your_key
AZURE_SPEECH_REGION=eastus
OPENWEATHER_API_KEY=your_key

# Africa's Talking (optional for local testing)
AT_USERNAME=sandbox
AT_API_KEY=sandbox_key
```

### 4. Initialize Database

```bash
npm run migrate
ts-node src/database/seed.ts
```

### 5. Start Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## Test the API

```bash
# Health check
curl http://localhost:3000/webhooks/health

# Run test suite
chmod +x scripts/test-call.sh
./scripts/test-call.sh
```

## Next Steps

For production deployment:
1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for server setup
2. Read [KENYA_IMPLEMENTATION.md](./KENYA_IMPLEMENTATION.md) for Kenya-specific guide
3. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design

## Common Issues

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -d agronomic_chatbot
```

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=3001
```

## Docker Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Getting API Keys (Free Tier)

1. **Claude AI**: [console.anthropic.com](https://console.anthropic.com) - $5 free credit
2. **Azure Speech**: [azure.microsoft.com](https://azure.microsoft.com) - $200 free credit
3. **OpenWeather**: [openweathermap.org](https://openweathermap.org) - Free tier available

## Support

- Issues: Create GitHub issue
- Documentation: See README.md
- Architecture: See ARCHITECTURE.md
