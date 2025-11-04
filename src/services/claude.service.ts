import Anthropic from '@anthropic-ai/sdk';
import logger from '../config/logger';
import knowledgeBase from './knowledgeBase.service';
import weatherService from './weather.service';

class ClaudeService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    this.client = new Anthropic({
      apiKey,
    });
  }

  /**
   * Process farmer's query and generate response
   */
  async processQuery(
    userMessage: string,
    language: string,
    context: {
      location?: string;
      county?: string;
      conversationHistory?: Array<{ role: string; content: string }>;
    }
  ): Promise<string> {
    try {
      // Gather contextual information
      const weatherData = context.location
        ? await weatherService.getWeather(context.location)
        : null;

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(language, context, weatherData);

      // Prepare messages
      const messages: Anthropic.MessageParam[] = [];

      // Add conversation history if available
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        context.conversationHistory.forEach((msg) => {
          if (msg.role !== 'system') {
            messages.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            });
          }
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage,
      });

      // Call Claude API
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      const assistantMessage = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      logger.info('Claude response generated', {
        language,
        messageLength: assistantMessage.length,
      });

      return assistantMessage;
    } catch (error) {
      logger.error('Claude API error', { error });
      throw error;
    }
  }

  /**
   * Classify user intent from the query
   */
  async classifyIntent(userMessage: string, language: string): Promise<{
    intent: 'advice' | 'purchase' | 'weather' | 'market' | 'general';
    entities: any;
  }> {
    try {
      const prompt = `Analyze this farmer's query and classify the intent. Return ONLY a JSON object with this structure:
{
  "intent": "advice" | "purchase" | "weather" | "market" | "general",
  "entities": {
    "crop": "string or null",
    "product": "string or null",
    "quantity": "number or null",
    "location": "string or null"
  }
}

Query: "${userMessage}"`;

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = response.content[0].type === 'text'
        ? response.content[0].text
        : '{}';

      const result = JSON.parse(responseText);
      logger.info('Intent classified', { intent: result.intent, entities: result.entities });

      return result;
    } catch (error) {
      logger.error('Intent classification error', { error });
      // Default fallback
      return {
        intent: 'general',
        entities: {},
      };
    }
  }

  /**
   * Generate call summary
   */
  async generateSummary(
    conversationHistory: Array<{ role: string; content: string }>,
    language: string
  ): Promise<string> {
    try {
      const conversation = conversationHistory
        .filter((msg) => msg.role !== 'system')
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

      const summaryPrompt = this.getSummaryPrompt(language);

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `${summaryPrompt}\n\nConversation:\n${conversation}`,
          },
        ],
      });

      const summary = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      logger.info('Call summary generated', { language });
      return summary;
    } catch (error) {
      logger.error('Summary generation error', { error });
      throw error;
    }
  }

  /**
   * Build system prompt for Claude
   */
  private buildSystemPrompt(
    language: string,
    context: any,
    weatherData: any
  ): string {
    const languageInstructions = {
      en: 'Respond in English.',
      sw: 'Respond in Swahili (Kenya).',
      luo: 'Respond in Luo language.',
      ki: 'Respond in Kikuyu language.',
    };

    const instruction = languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en;

    let prompt = `You are an expert agricultural advisor helping farmers in Kenya. ${instruction}

Your role:
- Provide practical, actionable farming advice
- Answer questions about crops, livestock, pests, diseases, and farming techniques
- Recommend appropriate products (fertilizers, pesticides, seeds)
- Share market prices and weather information
- Help farmers make informed decisions
- Be concise and clear in your responses (aim for 2-3 sentences for voice calls)

Guidelines:
- Always consider local Kenyan context and conditions
- Use simple language farmers can understand
- Provide specific recommendations when possible
- If you don't know something, admit it
- For product purchases, ask clarifying questions about quantity and delivery

`;

    // Add location context
    if (context.location || context.county) {
      prompt += `\nFarmer's location: ${context.county || context.location}\n`;
    }

    // Add weather context
    if (weatherData) {
      prompt += `\nCurrent weather in ${weatherData.location}:
- Temperature: ${weatherData.temperature}°C
- Conditions: ${weatherData.description}
- Humidity: ${weatherData.humidity}%
- Wind: ${weatherData.windSpeed} m/s\n`;
    }

    // Add knowledge base snippets
    prompt += `\n${knowledgeBase.getContextSnippets()}\n`;

    return prompt;
  }

  /**
   * Get summary prompt based on language
   */
  private getSummaryPrompt(language: string): string {
    const prompts = {
      en: 'Summarize this conversation between a farmer and agricultural advisor. Include key questions asked and advice given. Keep it under 160 characters for SMS.',
      sw: 'Fupisha mazungumzo haya kati ya mkulima na mshauri wa kilimo. Jumuisha maswali muhimu na ushauri uliotolewa. Ifanye iwe chini ya herufi 160 kwa SMS.',
      luo: 'Summarize this conversation in Luo. Keep it under 160 characters.',
      ki: 'Summarize this conversation in Kikuyu. Keep it under 160 characters.',
    };

    return prompts[language as keyof typeof prompts] || prompts.en;
  }
}

export default new ClaudeService();
