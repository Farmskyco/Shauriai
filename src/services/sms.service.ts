import africasTalkingService from './africasTalking.service';
import logger from '../config/logger';
import CallSession from '../models/CallSession';

class SMSService {
  /**
   * Send call summary SMS to farmer
   */
  async sendCallSummary(
    sessionId: string,
    phoneNumber: string,
    summary: string
  ): Promise<boolean> {
    try {
      const message = this.formatSummaryMessage(summary);
      await africasTalkingService.sendSMS(phoneNumber, message);

      // Update session to mark SMS as sent
      await CallSession.update(
        { smsSent: true },
        { where: { id: sessionId } }
      );

      logger.info('Call summary SMS sent', { sessionId, phoneNumber });
      return true;
    } catch (error) {
      logger.error('Failed to send summary SMS', { sessionId, error });
      return false;
    }
  }

  /**
   * Send order confirmation SMS
   */
  async sendOrderConfirmation(
    phoneNumber: string,
    orderDetails: string
  ): Promise<boolean> {
    try {
      await africasTalkingService.sendSMS(phoneNumber, orderDetails);
      logger.info('Order confirmation SMS sent', { phoneNumber });
      return true;
    } catch (error) {
      logger.error('Failed to send order confirmation', { error });
      return false;
    }
  }

  /**
   * Send weather alert SMS
   */
  async sendWeatherAlert(
    phoneNumber: string,
    alertMessage: string
  ): Promise<boolean> {
    try {
      await africasTalkingService.sendSMS(phoneNumber, alertMessage);
      logger.info('Weather alert SMS sent', { phoneNumber });
      return true;
    } catch (error) {
      logger.error('Failed to send weather alert', { error });
      return false;
    }
  }

  /**
   * Send bulk SMS to multiple farmers
   */
  async sendBulkSMS(
    phoneNumbers: string[],
    message: string
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const phoneNumber of phoneNumbers) {
      try {
        await africasTalkingService.sendSMS(phoneNumber, message);
        success++;
      } catch (error) {
        failed++;
        logger.error('Bulk SMS failed for number', { phoneNumber, error });
      }

      // Rate limiting - wait 100ms between messages
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    logger.info('Bulk SMS completed', { success, failed, total: phoneNumbers.length });
    return { success, failed };
  }

  /**
   * Format summary message to fit SMS limits (160 chars)
   */
  private formatSummaryMessage(summary: string): string {
    const prefix = 'Call Summary: ';
    const maxLength = 160 - prefix.length;

    if (summary.length <= maxLength) {
      return prefix + summary;
    }

    // Truncate and add ellipsis
    return prefix + summary.substring(0, maxLength - 3) + '...';
  }

  /**
   * Send welcome SMS to new users
   */
  async sendWelcomeSMS(phoneNumber: string, language: string): Promise<boolean> {
    const messages = {
      en: 'Welcome to Agricultural Advisory Service! Call our toll-free number anytime for farming advice. Reply STOP to unsubscribe.',
      sw: 'Karibu kwa Huduma ya Ushauri wa Kilimo! Piga nambari yetu ya bure wakati wowote kwa ushauri wa kilimo. Jibu STOP kujiondoa.',
      luo: 'Welcome to Agricultural Advisory Service! Call our toll-free number anytime.',
      ki: 'Welcome to Agricultural Advisory Service! Call our toll-free number anytime.',
    };

    const message = messages[language as keyof typeof messages] || messages.en;

    try {
      await africasTalkingService.sendSMS(phoneNumber, message);
      logger.info('Welcome SMS sent', { phoneNumber });
      return true;
    } catch (error) {
      logger.error('Failed to send welcome SMS', { error });
      return false;
    }
  }
}

export default new SMSService();
