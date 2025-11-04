import { v4 as uuidv4 } from 'uuid';
import redis from '../config/redis';
import logger from '../config/logger';
import User from '../models/User';
import CallSession from '../models/CallSession';
import Conversation from '../models/Conversation';

interface SessionData {
  userId: string;
  sessionId: string;
  phoneNumber: string;
  language: string;
  state: 'language_selection' | 'main_menu' | 'conversation' | 'purchase' | 'ended';
  conversationHistory: Array<{ role: string; content: string }>;
  context: {
    location?: string;
    county?: string;
    currentProduct?: string;
    currentOrderId?: string;
  };
  startTime: number;
}

class SessionService {
  private readonly SESSION_TTL = 3600; // 1 hour
  private readonly SESSION_PREFIX = 'session:';

  /**
   * Create or retrieve user
   */
  async getOrCreateUser(phoneNumber: string): Promise<User> {
    try {
      let user = await User.findOne({ where: { phoneNumber } });

      if (!user) {
        user = await User.create({
          phoneNumber,
          preferredLanguage: 'sw', // Default to Swahili
        });
        logger.info('New user created', { userId: user.id, phoneNumber });
      }

      return user;
    } catch (error) {
      logger.error('User creation error', { phoneNumber, error });
      throw error;
    }
  }

  /**
   * Initialize new session
   */
  async initializeSession(
    phoneNumber: string,
    atSessionId: string
  ): Promise<SessionData> {
    try {
      const user = await getOrCreateUser(phoneNumber);

      // Create call session in database
      const callSession = await CallSession.create({
        userId: user.id,
        sessionId: atSessionId,
        phoneNumber,
        language: user.preferredLanguage,
        status: 'active',
        startedAt: new Date(),
        smsSent: false,
      });

      const sessionData: SessionData = {
        userId: user.id,
        sessionId: callSession.id,
        phoneNumber,
        language: user.preferredLanguage,
        state: 'language_selection',
        conversationHistory: [],
        context: {
          location: user.location,
          county: user.county,
        },
        startTime: Date.now(),
      };

      // Store in Redis
      await this.saveSession(atSessionId, sessionData);

      logger.info('Session initialized', {
        sessionId: callSession.id,
        userId: user.id,
      });

      return sessionData;
    } catch (error) {
      logger.error('Session initialization error', { phoneNumber, error });
      throw error;
    }
  }

  /**
   * Get session data
   */
  async getSession(atSessionId: string): Promise<SessionData | null> {
    try {
      const key = this.SESSION_PREFIX + atSessionId;
      const data = await redis.get(key);

      if (!data) {
        logger.warn('Session not found', { atSessionId });
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      logger.error('Get session error', { atSessionId, error });
      return null;
    }
  }

  /**
   * Save session data
   */
  async saveSession(atSessionId: string, data: SessionData): Promise<void> {
    try {
      const key = this.SESSION_PREFIX + atSessionId;
      await redis.setex(key, this.SESSION_TTL, JSON.stringify(data));
    } catch (error) {
      logger.error('Save session error', { atSessionId, error });
      throw error;
    }
  }

  /**
   * Update session state
   */
  async updateSessionState(
    atSessionId: string,
    state: SessionData['state']
  ): Promise<void> {
    const session = await this.getSession(atSessionId);
    if (session) {
      session.state = state;
      await this.saveSession(atSessionId, session);
    }
  }

  /**
   * Update session language
   */
  async updateSessionLanguage(
    atSessionId: string,
    language: string
  ): Promise<void> {
    const session = await this.getSession(atSessionId);
    if (session) {
      session.language = language;
      await this.saveSession(atSessionId, session);

      // Update user's preferred language
      await User.update(
        { preferredLanguage: language as any },
        { where: { id: session.userId } }
      );

      // Update call session language
      await CallSession.update(
        { language: language as any },
        { where: { id: session.sessionId } }
      );
    }
  }

  /**
   * Add message to conversation history
   */
  async addMessage(
    atSessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    audioUrl?: string
  ): Promise<void> {
    const session = await this.getSession(atSessionId);
    if (session) {
      session.conversationHistory.push({ role, content });

      // Keep only last 10 messages to avoid memory issues
      if (session.conversationHistory.length > 10) {
        session.conversationHistory = session.conversationHistory.slice(-10);
      }

      await this.saveSession(atSessionId, session);

      // Save to database
      await Conversation.create({
        sessionId: session.sessionId,
        role,
        content,
        audioUrl,
        timestamp: new Date(),
      });
    }
  }

  /**
   * End session
   */
  async endSession(atSessionId: string): Promise<void> {
    try {
      const session = await this.getSession(atSessionId);
      if (!session) return;

      const duration = Math.floor((Date.now() - session.startTime) / 1000);

      // Update call session in database
      await CallSession.update(
        {
          status: 'completed',
          endedAt: new Date(),
          duration,
        },
        { where: { id: session.sessionId } }
      );

      // Remove from Redis
      const key = this.SESSION_PREFIX + atSessionId;
      await redis.del(key);

      logger.info('Session ended', {
        sessionId: session.sessionId,
        duration,
      });
    } catch (error) {
      logger.error('End session error', { atSessionId, error });
    }
  }

  /**
   * Get active sessions count (for monitoring)
   */
  async getActiveSessionsCount(): Promise<number> {
    try {
      const keys = await redis.keys(this.SESSION_PREFIX + '*');
      return keys.length;
    } catch (error) {
      logger.error('Get active sessions error', { error });
      return 0;
    }
  }
}

// Helper function to avoid circular dependency
async function getOrCreateUser(phoneNumber: string): Promise<User> {
  let user = await User.findOne({ where: { phoneNumber } });
  if (!user) {
    user = await User.create({
      phoneNumber,
      preferredLanguage: 'sw',
    });
  }
  return user;
}

export default new SessionService();
