import { Request, Response } from 'express';
import logger from '../config/logger';
import sessionService from '../services/session.service';
import africasTalkingService from '../services/africasTalking.service';
import speechService from '../services/speech.service';
import claudeService from '../services/claude.service';
import smsService from '../services/sms.service';
import ecommerceService from '../services/ecommerce.service';

class VoiceController {
  /**
   * Handle incoming call
   */
  async handleIncomingCall(req: Request, res: Response) {
    try {
      const { sessionId, phoneNumber, isActive } = req.body;

      logger.info('Incoming call', { sessionId, phoneNumber, isActive });

      if (isActive === '1') {
        // Initialize session
        await sessionService.initializeSession(phoneNumber, sessionId);

        // Return language selection IVR
        const response = africasTalkingService.generateLanguageSelectionIVR();
        res.set('Content-Type', 'application/xml');
        res.send(response);
      } else {
        // Call ended
        await this.handleCallEnded(sessionId);
        res.send('');
      }
    } catch (error) {
      logger.error('Error handling incoming call', { error });
      res.status(500).send('Error');
    }
  }

  /**
   * Handle language selection
   */
  async handleLanguageSelection(req: Request, res: Response) {
    try {
      const { sessionId, dtmfDigits } = req.body;

      logger.info('Language selected', { sessionId, dtmfDigits });

      const languageMap: { [key: string]: string } = {
        '1': 'en',
        '2': 'sw',
        '3': 'luo',
        '4': 'ki',
      };

      const language = languageMap[dtmfDigits] || 'sw';
      await sessionService.updateSessionLanguage(sessionId, language);
      await sessionService.updateSessionState(sessionId, 'main_menu');

      // Return main menu
      const response = africasTalkingService.generateMainMenuIVR(language);
      res.set('Content-Type', 'application/xml');
      res.send(response);
    } catch (error) {
      logger.error('Error handling language selection', { error });
      res.status(500).send('Error');
    }
  }

  /**
   * Handle main menu selection
   */
  async handleMenuSelection(req: Request, res: Response) {
    try {
      const { sessionId, dtmfDigits } = req.body;

      logger.info('Menu selected', { sessionId, dtmfDigits });

      const session = await sessionService.getSession(sessionId);
      if (!session) {
        res.send('Session expired');
        return;
      }

      if (dtmfDigits === '0') {
        // Voice interaction
        await sessionService.updateSessionState(sessionId, 'conversation');
        const response = africasTalkingService.generateRecordingIVR(
          session.language
        );
        res.set('Content-Type', 'application/xml');
        res.send(response);
      } else if (dtmfDigits === '1') {
        // Agronomic advice
        await sessionService.updateSessionState(sessionId, 'conversation');
        await sessionService.addMessage(
          sessionId,
          'system',
          'User selected: Agronomic advice'
        );
        const response = africasTalkingService.generateRecordingIVR(
          session.language
        );
        res.set('Content-Type', 'application/xml');
        res.send(response);
      } else if (dtmfDigits === '2') {
        // Purchase inputs
        await sessionService.updateSessionState(sessionId, 'purchase');
        await sessionService.addMessage(
          sessionId,
          'system',
          'User selected: Purchase inputs'
        );
        const response = africasTalkingService.generateRecordingIVR(
          session.language
        );
        res.set('Content-Type', 'application/xml');
        res.send(response);
      } else {
        // Invalid selection
        const response = africasTalkingService.generateMainMenuIVR(
          session.language
        );
        res.set('Content-Type', 'application/xml');
        res.send(response);
      }
    } catch (error) {
      logger.error('Error handling menu selection', { error });
      res.status(500).send('Error');
    }
  }

  /**
   * Handle recording complete
   */
  async handleRecordingComplete(req: Request, res: Response) {
    try {
      const { sessionId, recordingUrl } = req.body;

      logger.info('Recording received', { sessionId, recordingUrl });

      const session = await sessionService.getSession(sessionId);
      if (!session) {
        res.send('Session expired');
        return;
      }

      // Process in background
      this.processRecording(sessionId, recordingUrl, session).catch((err) => {
        logger.error('Background processing error', { err });
      });

      // Return immediate response
      const waitMessage =
        session.language === 'sw'
          ? 'Tafadhali subiri tunapochakata swali lako...'
          : 'Please wait while we process your question...';

      const response = africasTalkingService.generateSayIVR(waitMessage, false);
      res.set('Content-Type', 'application/xml');
      res.send(response);
    } catch (error) {
      logger.error('Error handling recording', { error });
      res.status(500).send('Error');
    }
  }

  /**
   * Handle continue conversation
   */
  async handleContinueConversation(req: Request, res: Response) {
    try {
      const { sessionId, dtmfDigits } = req.body;

      logger.info('Continue conversation', { sessionId, dtmfDigits });

      const session = await sessionService.getSession(sessionId);
      if (!session) {
        res.send('Session expired');
        return;
      }

      if (dtmfDigits === '1') {
        // Continue - ask for another recording
        const response = africasTalkingService.generateRecordingIVR(
          session.language
        );
        res.set('Content-Type', 'application/xml');
        res.send(response);
      } else {
        // End call
        await this.handleCallEnded(sessionId);
        const thankYouMessage =
          session.language === 'sw'
            ? 'Asante kwa kupiga. Kwaheri!'
            : 'Thank you for calling. Goodbye!';

        const response = africasTalkingService.generateSayIVR(
          thankYouMessage,
          false
        );
        res.set('Content-Type', 'application/xml');
        res.send(response);
      }
    } catch (error) {
      logger.error('Error handling continue', { error });
      res.status(500).send('Error');
    }
  }

  /**
   * Process recording in background
   */
  private async processRecording(
    sessionId: string,
    recordingUrl: string,
    session: any
  ) {
    try {
      // Step 1: Speech to text
      const userText = await speechService.speechToText(
        recordingUrl,
        session.language
      );
      logger.info('STT completed', { sessionId, text: userText });

      await sessionService.addMessage(
        sessionId,
        'user',
        userText,
        recordingUrl
      );

      // Step 2: Determine intent
      const { intent } = await claudeService.classifyIntent(
        userText,
        session.language
      );

      let responseText = '';

      if (session.state === 'purchase' || intent === 'purchase') {
        // Handle purchase flow
        responseText = await this.handlePurchaseFlow(
          userText,
          session,
          sessionId
        );
      } else {
        // Step 3: Get AI response
        responseText = await claudeService.processQuery(userText, session.language, {
          location: session.context.location,
          county: session.context.county,
          conversationHistory: session.conversationHistory,
        });
      }

      logger.info('AI response generated', { sessionId, responseLength: responseText.length });

      await sessionService.addMessage(sessionId, 'assistant', responseText);

      // Step 4: Text to speech
      const audioBuffer = await speechService.textToSpeech(
        responseText,
        session.language
      );

      // Step 5: Save audio and get URL
      const audioFilename = `response-${sessionId}-${Date.now()}.wav`;
      const audioUrl = await speechService.saveAudioFile(
        audioBuffer,
        audioFilename
      );

      logger.info('TTS completed', { sessionId, audioUrl });

      // Note: In production, you'd need to use AT's callback mechanism
      // to play this audio back to the user
    } catch (error) {
      logger.error('Recording processing error', { sessionId, error });
    }
  }

  /**
   * Handle purchase flow
   */
  private async handlePurchaseFlow(
    userText: string,
    session: any,
    sessionId: string
  ): Promise<string> {
    try {
      // Use Claude to extract product and quantity
      const { intent, entities } = await claudeService.classifyIntent(
        userText,
        session.language
      );

      if (entities.product) {
        // Search for product
        const products = await ecommerceService.searchProducts(
          entities.product,
          'fertilizer',
          session.language
        );

        if (products.length > 0) {
          const product = products[0];
          const quantity = entities.quantity || 1;

          // Create order
          const order = await ecommerceService.createOrder({
            sessionId: session.sessionId,
            userId: session.userId,
            productId: product.id,
            quantity,
            notes: userText,
          });

          if (order) {
            // Send order confirmation SMS
            const orderSummary = ecommerceService.formatOrderSummary(
              order,
              product,
              session.language
            );
            await smsService.sendOrderConfirmation(
              session.phoneNumber,
              orderSummary
            );

            return session.language === 'sw'
              ? `Oda yako ya ${product.nameSwahili || product.name} imerekodiwa. Jumla ni KES ${order.totalPrice}. Tutakupigia kwa maelezo ya malipo.`
              : `Your order for ${product.name} has been recorded. Total is KES ${order.totalPrice}. We'll call you for payment details.`;
          }
        }

        return session.language === 'sw'
          ? 'Samahani, hatukupata bidhaa hiyo. Tafadhali jaribu tena.'
          : 'Sorry, we could not find that product. Please try again.';
      }

      // Default response
      return session.language === 'sw'
        ? 'Tafadhali niambie bidhaa unavyotaka kununua na kiasi.'
        : 'Please tell me what product you want to buy and the quantity.';
    } catch (error) {
      logger.error('Purchase flow error', { error });
      return session.language === 'sw'
        ? 'Samahani, kulikuwa na tatizo. Tafadhali jaribu tena.'
        : 'Sorry, there was an error. Please try again.';
    }
  }

  /**
   * Handle call ended
   */
  private async handleCallEnded(sessionId: string) {
    try {
      const session = await sessionService.getSession(sessionId);
      if (!session) return;

      // Generate summary if there was a conversation
      if (session.conversationHistory.length > 0) {
        const summary = await claudeService.generateSummary(
          session.conversationHistory,
          session.language
        );

        // Update session with summary
        const CallSession = require('../models/CallSession').default;
        await CallSession.update(
          { summary },
          { where: { id: session.sessionId } }
        );

        // Send SMS summary
        await smsService.sendCallSummary(
          session.sessionId,
          session.phoneNumber,
          summary
        );
      }

      // End session
      await sessionService.endSession(sessionId);

      logger.info('Call ended and processed', { sessionId });
    } catch (error) {
      logger.error('Error handling call end', { sessionId, error });
    }
  }
}

export default new VoiceController();
