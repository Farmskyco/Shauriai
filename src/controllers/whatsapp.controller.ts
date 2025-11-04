import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';
import whatsappService from '../services/whatsapp.service';
import imageAnalysisService from '../services/imageAnalysis.service';
import diseaseKnowledgeService from '../services/diseaseKnowledge.service';
import ecommerceService from '../services/ecommerce.service';
import claudeService from '../services/claude.service';
import weatherService from '../services/weather.service';
import User from '../models/User';
import WhatsAppSession from '../models/WhatsAppSession';
import PlantAnalysis from '../models/PlantAnalysis';
import Product from '../models/Product';

class WhatsAppController {
  /**
   * Handle incoming WhatsApp messages
   */
  async handleIncomingMessage(req: Request, res: Response) {
    try {
      const { from, text, image, button, list } = req.body;

      logger.info('WhatsApp message received', { from, hasText: !!text, hasImage: !!image });

      // Get or create user
      const user = await this.getOrCreateUser(from);

      // Get or create session
      let session = await whatsappService.getSession(from);
      if (!session) {
        session = await this.initializeSession(user, from);
      }

      // Update last activity
      session.lastActivityAt = new Date();

      // Route message based on content and state
      if (image) {
        await this.handleImageMessage(from, image, session, user);
      } else if (button) {
        await this.handleButtonResponse(from, button, session, user);
      } else if (list) {
        await this.handleListResponse(from, list, session, user);
      } else if (text) {
        await this.handleTextMessage(from, text, session, user);
      }

      // Save session
      await whatsappService.storeSession(from, session);

      res.status(200).send('OK');
    } catch (error) {
      logger.error('Error handling WhatsApp message', { error });
      res.status(500).send('Error');
    }
  }

  /**
   * Handle image messages (plant disease detection)
   */
  private async handleImageMessage(
    phoneNumber: string,
    imageUrl: string,
    session: any,
    user: User
  ) {
    try {
      // Send acknowledgment
      await whatsappService.sendMessage(
        phoneNumber,
        session.language === 'sw'
          ? '🔬 Ninachambua picha yako... Tafadhali subiri...'
          : '🔬 Analyzing your image... Please wait...'
      );

      // Update session state
      session.state = 'analyzing';
      await whatsappService.storeSession(phoneNumber, session);

      // Download image
      const imageBuffer = await whatsappService.downloadImage(imageUrl);

      // Save image
      const filename = `${uuidv4()}.jpg`;
      const savedImageUrl = await imageAnalysisService.saveImage(imageBuffer, filename);

      // Analyze image
      const analysis = await imageAnalysisService.analyzePlantImage(
        imageBuffer,
        session.language
      );

      // Enhance recommendations with knowledge base
      const additionalInfo = diseaseKnowledgeService.getTreatmentRecommendations(
        analysis.detectedDiseases,
        analysis.detectedDeficiencies
      );

      // Merge recommendations
      const allRecommendations = [
        ...analysis.recommendations,
        ...additionalInfo.treatments,
      ];
      const allProducts = [
        ...analysis.recommendedProducts,
        ...additionalInfo.products,
      ];

      // Save analysis to database
      const plantAnalysis = await PlantAnalysis.create({
        userId: user.id,
        whatsappSessionId: session.id,
        imageUrl: savedImageUrl,
        analysisResult: analysis,
        detectedDiseases: analysis.detectedDiseases,
        detectedDeficiencies: analysis.detectedDeficiencies,
        confidence: analysis.confidence,
        recommendations: allRecommendations.slice(0, 5),
        recommendedProducts: allProducts.slice(0, 5),
        status: 'completed',
      });

      // Format diagnosis message
      const diagnosisMessage = whatsappService.formatDiagnosisMessage(
        {
          ...analysis,
          recommendations: allRecommendations.slice(0, 5),
          recommendedProducts: allProducts.slice(0, 5),
        },
        session.language
      );

      // Send diagnosis
      await whatsappService.sendMessage(phoneNumber, diagnosisMessage);

      // Store analysis ID in session
      session.context.currentAnalysisId = plantAnalysis.id;
      session.context.recommendedProducts = allProducts.slice(0, 5);

      // Offer to buy products
      if (allProducts.length > 0) {
        await this.offerProductPurchase(phoneNumber, allProducts, session.language);
      }

      // Update session state
      session.state = 'main_menu';
    } catch (error) {
      logger.error('Image analysis error', { error });
      await whatsappService.sendMessage(
        phoneNumber,
        session.language === 'sw'
          ? '❌ Samahani, imeshindikana kuchambua picha. Tafadhali jaribu tena.'
          : '❌ Sorry, failed to analyze the image. Please try again.'
      );
    }
  }

  /**
   * Handle text messages
   */
  private async handleTextMessage(
    phoneNumber: string,
    text: string,
    session: any,
    user: User
  ) {
    const lowerText = text.toLowerCase().trim();

    // Check for menu options
    if (['1', 'disease', 'detect', 'utambuzi'].includes(lowerText)) {
      await this.startDiseaseDetection(phoneNumber, session);
    } else if (['2', 'advice', 'ushauri'].includes(lowerText)) {
      await this.handleFarmingAdvice(phoneNumber, text, session, user);
    } else if (['3', 'buy', 'shop', 'nunua'].includes(lowerText)) {
      await this.showProductCatalog(phoneNumber, session);
    } else if (['4', 'weather', 'hali ya hewa'].includes(lowerText)) {
      await this.handleWeatherRequest(phoneNumber, session, user);
    } else if (session.state === 'checkout') {
      await this.handleCheckout(phoneNumber, text, session, user);
    } else {
      // General farming question - use AI
      await this.handleFarmingAdvice(phoneNumber, text, session, user);
    }
  }

  /**
   * Start disease detection flow
   */
  private async startDiseaseDetection(phoneNumber: string, session: any) {
    session.state = 'awaiting_image';
    await whatsappService.storeSession(phoneNumber, session);

    const message = whatsappService.getDiseaseDetectionPrompt(session.language);
    await whatsappService.sendMessage(phoneNumber, message);
  }

  /**
   * Handle farming advice with AI
   */
  private async handleFarmingAdvice(
    phoneNumber: string,
    question: string,
    session: any,
    user: User
  ) {
    try {
      // Send thinking message
      await whatsappService.sendMessage(
        phoneNumber,
        session.language === 'sw' ? '🤔 Ninafikiria...' : '🤔 Thinking...'
      );

      // Get AI response
      const response = await claudeService.processQuery(question, session.language, {
        location: user.location,
        county: user.county,
      });

      // Send response
      await whatsappService.sendMessage(phoneNumber, response);

      // Send main menu
      await this.sendMainMenu(phoneNumber, session.language);
    } catch (error) {
      logger.error('Advice error', { error });
      await whatsappService.sendMessage(
        phoneNumber,
        session.language === 'sw'
          ? '❌ Samahani, imeshindikana kupata jibu. Jaribu tena.'
          : '❌ Sorry, failed to get answer. Try again.'
      );
    }
  }

  /**
   * Show product catalog
   */
  private async showProductCatalog(phoneNumber: string, session: any) {
    try {
      const products = await ecommerceService.getPopularFertilizers(10);

      const sections = [
        {
          title: session.language === 'sw' ? 'Mbolea' : 'Fertilizers',
          rows: products
            .filter((p) => p.category === 'fertilizer')
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              title: p.name,
              description: `KES ${p.price} - ${p.unit}`,
            })),
        },
      ];

      await whatsappService.sendListMessage(
        phoneNumber,
        session.language === 'sw'
          ? '🛒 Chagua bidhaa unayotaka kununua:'
          : '🛒 Select the product you want to buy:',
        session.language === 'sw' ? 'Chagua Bidhaa' : 'Select Product',
        sections
      );

      session.state = 'checkout';
      await whatsappService.storeSession(phoneNumber, session);
    } catch (error) {
      logger.error('Product catalog error', { error });
    }
  }

  /**
   * Offer product purchase
   */
  private async offerProductPurchase(
    phoneNumber: string,
    productNames: string[],
    language: string
  ) {
    try {
      // Search for matching products
      const matchedProducts = await Promise.all(
        productNames.slice(0, 3).map((name) =>
          ecommerceService.searchProducts(name, undefined, language)
        )
      );

      const products = matchedProducts.flat().slice(0, 5);

      if (products.length > 0) {
        const buttons = products.map((p, index) => ({
          id: p.id,
          title: `${index + 1}. ${p.name.substring(0, 20)}`,
        }));

        await whatsappService.sendButtonMessage(
          phoneNumber,
          language === 'sw'
            ? '🛒 *Unahitaji kununua moja ya bidhaa hizi?*\n\nChagua bidhaa:'
            : '🛒 *Do you need to buy any of these products?*\n\nSelect product:',
          buttons.slice(0, 3) // WhatsApp limits to 3 buttons
        );
      }
    } catch (error) {
      logger.error('Product offer error', { error });
    }
  }

  /**
   * Handle button responses
   */
  private async handleButtonResponse(
    phoneNumber: string,
    buttonId: string,
    session: any,
    user: User
  ) {
    try {
      // Button ID is product ID
      const product = await Product.findByPk(buttonId);

      if (product) {
        session.context.selectedProductId = product.id;
        session.state = 'checkout';
        await whatsappService.storeSession(phoneNumber, session);

        await whatsappService.sendMessage(
          phoneNumber,
          session.language === 'sw'
            ? `✅ Umechagua: *${product.nameSwahili || product.name}*\n\nBei: KES ${product.price}\n\nNingapi ungataka kununua? (Andika idadi)`
            : `✅ You selected: *${product.name}*\n\nPrice: KES ${product.price}\n\nHow many would you like to buy? (Enter quantity)`
        );
      }
    } catch (error) {
      logger.error('Button response error', { error });
    }
  }

  /**
   * Handle list responses (product selection)
   */
  private async handleListResponse(
    phoneNumber: string,
    listItemId: string,
    session: any,
    user: User
  ) {
    await this.handleButtonResponse(phoneNumber, listItemId, session, user);
  }

  /**
   * Handle checkout process
   */
  private async handleCheckout(
    phoneNumber: string,
    text: string,
    session: any,
    user: User
  ) {
    try {
      const quantity = parseInt(text.trim());

      if (isNaN(quantity) || quantity < 1) {
        await whatsappService.sendMessage(
          phoneNumber,
          session.language === 'sw'
            ? '❌ Tafadhali andika nambari sahihi ya kiasi.'
            : '❌ Please enter a valid quantity number.'
        );
        return;
      }

      const productId = session.context.selectedProductId;
      const product = await Product.findByPk(productId);

      if (!product) {
        await whatsappService.sendMessage(
          phoneNumber,
          session.language === 'sw'
            ? '❌ Bidhaa haipatikani.'
            : '❌ Product not available.'
        );
        return;
      }

      // Create order (assuming this is a WhatsApp session, no call session)
      const order = await ecommerceService.createOrder({
        sessionId: session.id || uuidv4(),
        userId: user.id,
        productId: product.id,
        quantity,
        notes: 'WhatsApp order',
      });

      if (order) {
        const orderSummary = ecommerceService.formatOrderSummary(
          order,
          product,
          session.language
        );

        await whatsappService.sendMessage(phoneNumber, orderSummary);

        // Send payment instructions
        await whatsappService.sendMessage(
          phoneNumber,
          session.language === 'sw'
            ? `💳 *Maelekezo ya Malipo*\n\nTuma KES ${order.totalPrice} kwa:\n📱 M-Pesa: 0700 000 000\n📝 Nambari ya Kumbukumbu: ${order.id.substring(0, 8).toUpperCase()}\n\nBaada ya kulipa, utapokea ujumbe wa uthibitisho.`
            : `💳 *Payment Instructions*\n\nSend KES ${order.totalPrice} to:\n📱 M-Pesa: 0700 000 000\n📝 Reference: ${order.id.substring(0, 8).toUpperCase()}\n\nAfter payment, you'll receive a confirmation message.`
        );

        // Reset session
        session.state = 'main_menu';
        session.context = {};
        await whatsappService.storeSession(phoneNumber, session);

        // Send main menu
        await this.sendMainMenu(phoneNumber, session.language);
      }
    } catch (error) {
      logger.error('Checkout error', { error });
      await whatsappService.sendMessage(
        phoneNumber,
        session.language === 'sw'
          ? '❌ Imeshindikana kukamilisha oda. Jaribu tena.'
          : '❌ Failed to complete order. Try again.'
      );
    }
  }

  /**
   * Handle weather request
   */
  private async handleWeatherRequest(
    phoneNumber: string,
    session: any,
    user: User
  ) {
    try {
      const location = user.county || user.location || 'Nairobi';
      const weather = await weatherService.getWeather(location);

      if (weather) {
        const message =
          session.language === 'sw'
            ? `🌤️ *Hali ya Hewa - ${weather.location}*\n\n🌡️ Joto: ${weather.temperature}°C\n📝 Hali: ${weather.description}\n💧 Unyevu: ${weather.humidity}%\n💨 Upepo: ${weather.windSpeed} m/s`
            : `🌤️ *Weather - ${weather.location}*\n\n🌡️ Temperature: ${weather.temperature}°C\n📝 Conditions: ${weather.description}\n💧 Humidity: ${weather.humidity}%\n💨 Wind: ${weather.windSpeed} m/s`;

        await whatsappService.sendMessage(phoneNumber, message);

        // Add farming advice based on weather
        const advice = weatherService.getWeatherAdvice(weather, session.language);
        if (advice) {
          await whatsappService.sendMessage(phoneNumber, `\n💡 ${advice}`);
        }
      }
    } catch (error) {
      logger.error('Weather request error', { error });
    }
  }

  /**
   * Send main menu
   */
  private async sendMainMenu(phoneNumber: string, language: string) {
    const message = whatsappService.getWelcomeMessage(language);
    await whatsappService.sendMessage(phoneNumber, message);
  }

  /**
   * Initialize session
   */
  private async initializeSession(user: User, phoneNumber: string) {
    const session = {
      id: uuidv4(),
      userId: user.id,
      phoneNumber,
      language: user.preferredLanguage,
      state: 'initial',
      context: {},
      lastActivityAt: new Date(),
    };

    // Send welcome message
    await this.sendMainMenu(phoneNumber, session.language);

    return session;
  }

  /**
   * Get or create user
   */
  private async getOrCreateUser(phoneNumber: string): Promise<User> {
    let user = await User.findOne({ where: { phoneNumber } });

    if (!user) {
      user = await User.create({
        phoneNumber,
        preferredLanguage: 'sw',
      });
      logger.info('New WhatsApp user created', { userId: user.id, phoneNumber });
    }

    return user;
  }
}

export default new WhatsAppController();
