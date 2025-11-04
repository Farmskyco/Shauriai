import axios from 'axios';
import FormData from 'form-data';
import logger from '../config/logger';
import redis from '../config/redis';

interface WhatsAppMessage {
  from: string;
  text?: string;
  image?: string;
  button?: string;
}

class WhatsAppService {
  private apiKey: string;
  private username: string;

  constructor() {
    this.apiKey = process.env.AT_API_KEY || '';
    this.username = process.env.AT_USERNAME || '';
  }

  /**
   * Send text message via WhatsApp
   */
  async sendMessage(to: string, message: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('username', this.username);
      formData.append('to', to);
      formData.append('message', message);

      const response = await axios.post(
        'https://api.africastalking.com/messaging/whatsapp/message',
        formData,
        {
          headers: {
            'apiKey': this.apiKey,
            'Accept': 'application/json',
            ...formData.getHeaders(),
          },
        }
      );

      logger.info('WhatsApp message sent', { to, response: response.data });
      return response.data;
    } catch (error) {
      logger.error('Failed to send WhatsApp message', { to, error });
      throw error;
    }
  }

  /**
   * Send image with caption
   */
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('username', this.username);
      formData.append('to', to);
      formData.append('image', imageUrl);
      if (caption) {
        formData.append('caption', caption);
      }

      const response = await axios.post(
        'https://api.africastalking.com/messaging/whatsapp/message',
        formData,
        {
          headers: {
            'apiKey': this.apiKey,
            'Accept': 'application/json',
            ...formData.getHeaders(),
          },
        }
      );

      logger.info('WhatsApp image sent', { to, imageUrl });
      return response.data;
    } catch (error) {
      logger.error('Failed to send WhatsApp image', { to, error });
      throw error;
    }
  }

  /**
   * Send interactive button message
   */
  async sendButtonMessage(
    to: string,
    body: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('username', this.username);
      formData.append('to', to);
      formData.append('body', body);
      formData.append('buttons', JSON.stringify(buttons));

      const response = await axios.post(
        'https://api.africastalking.com/messaging/whatsapp/message/interactive',
        formData,
        {
          headers: {
            'apiKey': this.apiKey,
            'Accept': 'application/json',
            ...formData.getHeaders(),
          },
        }
      );

      logger.info('WhatsApp button message sent', { to });
      return response.data;
    } catch (error) {
      logger.error('Failed to send WhatsApp button message', { to, error });
      throw error;
    }
  }

  /**
   * Send menu/list message
   */
  async sendListMessage(
    to: string,
    body: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('username', this.username);
      formData.append('to', to);
      formData.append('body', body);
      formData.append('buttonText', buttonText);
      formData.append('sections', JSON.stringify(sections));

      const response = await axios.post(
        'https://api.africastalking.com/messaging/whatsapp/message/list',
        formData,
        {
          headers: {
            'apiKey': this.apiKey,
            'Accept': 'application/json',
            ...formData.getHeaders(),
          },
        }
      );

      logger.info('WhatsApp list message sent', { to });
      return response.data;
    } catch (error) {
      logger.error('Failed to send WhatsApp list message', { to, error });
      throw error;
    }
  }

  /**
   * Download image from WhatsApp
   */
  async downloadImage(mediaUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        headers: {
          'apiKey': this.apiKey,
        },
      });

      return Buffer.from(response.data);
    } catch (error) {
      logger.error('Failed to download image from WhatsApp', { mediaUrl, error });
      throw error;
    }
  }

  /**
   * Get welcome message based on language
   */
  getWelcomeMessage(language: string): string {
    const messages = {
      en: `🌾 *Welcome to AgriAdvice!*

I'm your AI farming assistant. I can help you with:

1️⃣ 🔍 *Disease Detection* - Send a photo of your plant and I'll diagnose issues
2️⃣ 💬 *Farming Advice* - Ask me any farming question
3️⃣ 🛒 *Buy Inputs* - Purchase fertilizers and pesticides
4️⃣ 🌤️ *Weather Updates* - Get weather forecasts

Reply with a number (1-4) or just send a photo of your plant!`,

      sw: `🌾 *Karibu AgriAdvice!*

Mimi ni msaidizi wako wa AI wa kilimo. Ninaweza kukusaidia na:

1️⃣ 🔍 *Utambuzi wa Magonjwa* - Tuma picha ya mmea wako na nitachunguza matatizo
2️⃣ 💬 *Ushauri wa Kilimo* - Niulize swali lolote la kilimo
3️⃣ 🛒 *Nunua Pembejeo* - Nunua mbolea na dawa za wadudu
4️⃣ 🌤️ *Habari za Hali ya Hewa* - Pata utabiri wa hali ya hewa

Jibu na nambari (1-4) au tuma picha ya mmea wako!`,

      luo: `🌾 *Welcome to AgriAdvice!*

An AI farming assistant ma. Anyalo konyi gi:

1️⃣ 🔍 *Disease Detection* - Or foto mar puothni kendo ananyisi chandruok
2️⃣ 💬 *Farming Advice* - Penya penjo moro amora mar pur
3️⃣ 🛒 *Buy Inputs* - Ng'iew mbolea gi yedhe mag kweyo kwiri
4️⃣ 🌤️ *Weather Updates* - Yud puonj mar kwe

Dwok gi namba (1-4) kata or foto mar puothni!`,

      ki: `🌾 *Wamũkĩra AgriAdvice!*

Nĩ niĩ mũteithia waku wa AI wa ũrĩmi. Ndĩngĩhota gũgũteithia na:

1️⃣ 🔍 *Kũmenya Mĩrimũ* - Tũma mbica ya rũũa rwaku na nĩngũkũmenya mathina
2️⃣ 💬 *Kĩrĩra kĩa Ũrĩmi* - Njũũria kĩũria kĩothe gĩa ũrĩmi
3️⃣ 🛒 *Gũra Mbegũ* - Gũra nondo na ndawa cia kũũraga tũnguru
4️⃣ 🌤️ *Ũhoro wa Mbura* - Ona ũrĩa kĩrĩma gĩkaahaana

Cokia na namba (1-4) kana tũma mbica ya rũũa rwaku!`,
    };

    return messages[language as keyof typeof messages] || messages.en;
  }

  /**
   * Get disease detection prompt
   */
  getDiseaseDetectionPrompt(language: string): string {
    const prompts = {
      en: `📸 *Plant Disease Detection*

Please send a clear photo of:
- The affected plant leaves
- Any visible symptoms
- The entire plant (if possible)

Make sure the photo is:
✓ Well-lit
✓ In focus
✓ Shows the problem clearly

Waiting for your photo...`,

      sw: `📸 *Utambuzi wa Magonjwa ya Mimea*

Tafadhali tuma picha wazi ya:
- Majani yaliyoathiriwa ya mmea
- Dalili zozote zinazonekana
- Mmea wote (ikiwezekana)

Hakikisha picha ni:
✓ Yenye mwanga mzuri
✓ Wazi
✓ Inaonyesha tatizo wazi

Ningoje picha yako...`,

      luo: `📸 *Plant Disease Detection*

Yie iore foto malerie mar:
- It puoth mosetuo
- Ranyisi moro amora ma nenore
- Puoth duto (ka inyalo)

Ne ni foto ni:
✓ Nigi ler maber
✓ Kare
✓ Nyiso chandruok malerie

Arito fotoni...`,

      ki: `📸 *Kũmenya Mĩrimũ ya Mĩmera*

Tũma mbica ĩrĩ njega ya:
- Mathangũ ma rũũa marĩa mathĩnjĩtwo
- Imenyithia o rĩothe rĩrĩa rĩonekaga
- Rũũa rũothe (akorwo no kũhota)

Menya atĩ mbica ĩrĩ:
✓ Ĩrĩ ũtheri mwega
✓ Nĩ njega
✓ Yonanagia thina wega

Ndeterere mbica yaku...`,
    };

    return prompts[language as keyof typeof prompts] || prompts.en;
  }

  /**
   * Format diagnosis message
   */
  formatDiagnosisMessage(
    diagnosis: any,
    language: string
  ): string {
    const headers = {
      en: '🔬 *Analysis Results*',
      sw: '🔬 *Matokeo ya Uchunguzi*',
      luo: '🔬 *Dwoko mar Nono*',
      ki: '🔬 *Matokeo ma Ũthondeki*',
    };

    const diseaseLabels = {
      en: '\n🦠 *Detected Disease*:',
      sw: '\n🦠 *Ugonjwa Uliogunduliwa*:',
      luo: '\n🦠 *Tuo moyud*:',
      ki: '\n🦠 *Mũrimũ Ũrĩa Wonekete*:',
    };

    const deficiencyLabels = {
      en: '\n🌿 *Nutrient Deficiency*:',
      sw: '\n🌿 *Upungufu wa Virutubishi*:',
      luo: '\n🌿 *Chandruok mar Virutubishi*:',
      ki: '\n🌿 *Kwaga Kwa Virutubishi*:',
    };

    const recommendationLabels = {
      en: '\n💡 *Recommendations*:',
      sw: '\n💡 *Mapendekezo*:',
      luo: '\n💡 *Puonj*:',
      ki: '\n💡 *Mataaro*:',
    };

    let message = headers[language as keyof typeof headers] || headers.en;
    message += '\n\n';

    // Add diseases
    if (diagnosis.detectedDiseases && diagnosis.detectedDiseases.length > 0) {
      message += diseaseLabels[language as keyof typeof diseaseLabels];
      diagnosis.detectedDiseases.forEach((disease: string) => {
        message += `\n• ${disease}`;
      });
      message += '\n';
    }

    // Add deficiencies
    if (diagnosis.detectedDeficiencies && diagnosis.detectedDeficiencies.length > 0) {
      message += deficiencyLabels[language as keyof typeof deficiencyLabels];
      diagnosis.detectedDeficiencies.forEach((def: string) => {
        message += `\n• ${def}`;
      });
      message += '\n';
    }

    // Add confidence
    if (diagnosis.confidence) {
      const confidenceText = language === 'sw' ? 'Uhakika' : language === 'luo' ? 'Geno' : language === 'ki' ? 'Wĩhoko' : 'Confidence';
      message += `\n📊 *${confidenceText}*: ${Math.round(diagnosis.confidence * 100)}%\n`;
    }

    // Add recommendations
    if (diagnosis.recommendations && diagnosis.recommendations.length > 0) {
      message += recommendationLabels[language as keyof typeof recommendationLabels];
      diagnosis.recommendations.forEach((rec: string) => {
        message += `\n• ${rec}`;
      });
      message += '\n';
    }

    // Add products if available
    if (diagnosis.recommendedProducts && diagnosis.recommendedProducts.length > 0) {
      const productLabel = language === 'sw' ? '\n🛒 *Bidhaa Zinazopendekeza*:' :
                          language === 'luo' ? '\n🛒 *Gige ma inyalo ng\'iewo*:' :
                          language === 'ki' ? '\n🛒 *Indo Iria Twagũkĩra*:' :
                          '\n🛒 *Recommended Products*:';
      message += productLabel;
      diagnosis.recommendedProducts.forEach((prod: string, index: number) => {
        message += `\n${index + 1}. ${prod}`;
      });
    }

    return message;
  }

  /**
   * Store session in Redis
   */
  async storeSession(phoneNumber: string, sessionData: any): Promise<void> {
    const key = `whatsapp_session:${phoneNumber}`;
    await redis.setex(key, 3600, JSON.stringify(sessionData));
  }

  /**
   * Get session from Redis
   */
  async getSession(phoneNumber: string): Promise<any> {
    const key = `whatsapp_session:${phoneNumber}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Clear session
   */
  async clearSession(phoneNumber: string): Promise<void> {
    const key = `whatsapp_session:${phoneNumber}`;
    await redis.del(key);
  }
}

export default new WhatsAppService();
