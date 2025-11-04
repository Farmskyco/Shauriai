import AfricasTalking from 'africastalking';
import logger from '../config/logger';

class AfricasTalkingService {
  private client: any;
  private voice: any;
  private sms: any;

  constructor() {
    const username = process.env.AT_USERNAME;
    const apiKey = process.env.AT_API_KEY;

    if (!username || !apiKey) {
      throw new Error('Africa\'s Talking credentials not configured');
    }

    this.client = AfricasTalking({
      apiKey,
      username,
    });

    this.voice = this.client.VOICE;
    this.sms = this.client.SMS;
  }

  /**
   * Generate IVR response for language selection
   */
  generateLanguageSelectionIVR(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetDigits timeout="30" finishOnKey="#" callbackUrl="${process.env.WEBHOOK_URL}/language-selected">
    <Say voice="woman">Welcome to the Agricultural Advisory Service. Press 1 for English, Press 2 for Swahili, Press 3 for Luo, Press 4 for Kikuyu</Say>
    <Say voice="woman">Karibu kwa huduma ya ushauri wa kilimo. Bonyeza 1 kwa Kiingereza, Bonyeza 2 kwa Kiswahili, Bonyeza 3 kwa Kiluo, Bonyeza 4 kwa Kikuyu</Say>
  </GetDigits>
  <Say>We did not receive your selection. Goodbye.</Say>
</Response>`;
  }

  /**
   * Generate IVR response for main menu
   */
  generateMainMenuIVR(language: string): string {
    const menus = {
      en: 'Press 1 for farming advice, Press 2 to buy farm inputs, Press 0 to speak your question',
      sw: 'Bonyeza 1 kwa ushauri wa kilimo, Bonyeza 2 kununua pembejeo za kilimo, Bonyeza 0 kusema swali lako',
      luo: 'Press 1 for farming advice, Press 2 to buy farm inputs, Press 0 to speak your question', // TODO: Add Luo translation
      ki: 'Press 1 for farming advice, Press 2 to buy farm inputs, Press 0 to speak your question', // TODO: Add Kikuyu translation
    };

    const menuText = menus[language as keyof typeof menus] || menus.en;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetDigits timeout="30" finishOnKey="#" callbackUrl="${process.env.WEBHOOK_URL}/menu-selected">
    <Say voice="woman">${menuText}</Say>
  </GetDigits>
  <Say>We did not receive your selection. Goodbye.</Say>
</Response>`;
  }

  /**
   * Generate IVR to record farmer's voice
   */
  generateRecordingIVR(language: string): string {
    const prompts = {
      en: 'Please speak your question after the beep. Press the hash key when done.',
      sw: 'Tafadhali sema swali lako baada ya mlio. Bonyeza kitufe cha hash ukimaliza.',
      luo: 'Please speak your question after the beep. Press the hash key when done.',
      ki: 'Please speak your question after the beep. Press the hash key when done.',
    };

    const prompt = prompts[language as keyof typeof prompts] || prompts.en;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="woman">${prompt}</Say>
  <Record finishOnKey="#" maxLength="60" trimSilence="true" playBeep="true" callbackUrl="${process.env.WEBHOOK_URL}/recording-complete"/>
</Response>`;
  }

  /**
   * Generate IVR to play audio response
   */
  generatePlayAudioIVR(audioUrl: string, continueConversation: boolean = true): string {
    if (continueConversation) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play url="${audioUrl}"/>
  <GetDigits timeout="10" finishOnKey="#" numDigits="1" callbackUrl="${process.env.WEBHOOK_URL}/continue-conversation">
    <Say voice="woman">Press 1 to ask another question, or hang up to end the call.</Say>
  </GetDigits>
  <Say>Thank you for calling. Goodbye.</Say>
</Response>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play url="${audioUrl}"/>
  <Say>Thank you for calling. Goodbye.</Say>
</Response>`;
  }

  /**
   * Generate IVR to say text directly
   */
  generateSayIVR(text: string, continueConversation: boolean = true): string {
    if (continueConversation) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="woman">${this.escapeXml(text)}</Say>
  <GetDigits timeout="10" finishOnKey="#" numDigits="1" callbackUrl="${process.env.WEBHOOK_URL}/continue-conversation">
    <Say voice="woman">Press 1 to ask another question, or hang up to end the call.</Say>
  </GetDigits>
  <Say>Thank you for calling. Goodbye.</Say>
</Response>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="woman">${this.escapeXml(text)}</Say>
  <Say>Thank you for calling. Goodbye.</Say>
</Response>`;
  }

  /**
   * Send SMS message
   */
  async sendSMS(to: string, message: string): Promise<any> {
    try {
      const result = await this.sms.send({
        to: [to],
        message,
        from: process.env.AT_SHORT_CODE,
      });

      logger.info('SMS sent successfully', { to, result });
      return result;
    } catch (error) {
      logger.error('Failed to send SMS', { to, error });
      throw error;
    }
  }

  /**
   * Make outbound call (for testing or notifications)
   */
  async makeCall(to: string, callbackUrl: string): Promise<any> {
    try {
      const result = await this.voice.call({
        callTo: [to],
        callFrom: process.env.AT_SHORT_CODE,
      });

      logger.info('Outbound call initiated', { to, result });
      return result;
    } catch (error) {
      logger.error('Failed to make outbound call', { to, error });
      throw error;
    }
  }

  /**
   * Helper to escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export default new AfricasTalkingService();
