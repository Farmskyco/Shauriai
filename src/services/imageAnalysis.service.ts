import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import logger from '../config/logger';

class ImageAnalysisService {
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
   * Analyze plant image for diseases and deficiencies
   */
  async analyzePlantImage(
    imageBuffer: Buffer,
    language: string = 'en'
  ): Promise<{
    detectedDiseases: string[];
    detectedDeficiencies: string[];
    confidence: number;
    recommendations: string[];
    detailedAnalysis: string;
    recommendedProducts: string[];
  }> {
    try {
      // Optimize image for analysis
      const optimizedImage = await this.optimizeImage(imageBuffer);
      const base64Image = optimizedImage.toString('base64');

      // Determine media type
      const mediaType = 'image/jpeg';

      // Create analysis prompt
      const prompt = this.buildAnalysisPrompt(language);

      // Call Claude Vision API
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      });

      // Parse response
      const analysisText = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      const result = this.parseAnalysisResponse(analysisText, language);

      logger.info('Image analysis completed', {
        diseases: result.detectedDiseases.length,
        deficiencies: result.detectedDeficiencies.length,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      logger.error('Image analysis failed', { error });
      throw error;
    }
  }

  /**
   * Optimize image for analysis
   */
  private async optimizeImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Resize and compress image
      const optimized = await sharp(imageBuffer)
        .resize(1024, 1024, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      return optimized;
    } catch (error) {
      logger.error('Image optimization failed', { error });
      return imageBuffer;
    }
  }

  /**
   * Build analysis prompt
   */
  private buildAnalysisPrompt(language: string): string {
    const prompts = {
      en: `You are an expert agricultural pathologist and plant nutrition specialist. Analyze this plant image carefully and provide:

1. **Detected Diseases**: List any plant diseases visible in the image
2. **Nutrient Deficiencies**: Identify any nutrient deficiencies based on symptoms
3. **Confidence Level**: Your confidence in the diagnosis (0-100%)
4. **Detailed Analysis**: Describe what you observe in the image
5. **Recommendations**: Specific treatment and management recommendations
6. **Recommended Products**: Suggest specific fertilizers, fungicides, or pesticides

Format your response as JSON:
{
  "detectedDiseases": ["disease1", "disease2"],
  "detectedDeficiencies": ["deficiency1", "deficiency2"],
  "confidence": 85,
  "detailedAnalysis": "detailed description",
  "recommendations": ["recommendation1", "recommendation2"],
  "recommendedProducts": ["product1", "product2"]
}

Focus on common Kenyan agricultural conditions and crops.`,

      sw: `Wewe ni mtaalamu wa magonjwa ya mimea na lishe ya mmea. Chunguza picha hii ya mmea kwa makini na toa:

1. **Magonjwa Yaliyogunduliwa**: Orodhesha magonjwa yoyote ya mmea yanayoonekana
2. **Upungufu wa Virutubishi**: Tambua upungufu wowote wa virutubishi
3. **Kiwango cha Uhakika**: Uhakika wako katika utambuzi (0-100%)
4. **Uchambuzi wa Kina**: Eleza unachokiona katika picha
5. **Mapendekezo**: Mapendekezo mahususi ya matibabu na usimamizi
6. **Bidhaa Zinazopendekeza**: Pendekeza mbolea, dawa za kuvu, au dawa za wadudu

Andika jibu lako kama JSON:
{
  "detectedDiseases": ["ugonjwa1", "ugonjwa2"],
  "detectedDeficiencies": ["upungufu1", "upungufu2"],
  "confidence": 85,
  "detailedAnalysis": "maelezo ya kina",
  "recommendations": ["pendekezo1", "pendekezo2"],
  "recommendedProducts": ["bidhaa1", "bidhaa2"]
}

Zingatia hali za kawaida za kilimo nchini Kenya.`,
    };

    return prompts[language as keyof typeof prompts] || prompts.en;
  }

  /**
   * Parse Claude's analysis response
   */
  private parseAnalysisResponse(
    analysisText: string,
    language: string
  ): {
    detectedDiseases: string[];
    detectedDeficiencies: string[];
    confidence: number;
    recommendations: string[];
    detailedAnalysis: string;
    recommendedProducts: string[];
  } {
    try {
      // Try to extract JSON from response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          detectedDiseases: parsed.detectedDiseases || [],
          detectedDeficiencies: parsed.detectedDeficiencies || [],
          confidence: parsed.confidence || 0,
          recommendations: parsed.recommendations || [],
          detailedAnalysis: parsed.detailedAnalysis || analysisText,
          recommendedProducts: parsed.recommendedProducts || [],
        };
      }

      // Fallback parsing
      return {
        detectedDiseases: this.extractDiseases(analysisText),
        detectedDeficiencies: this.extractDeficiencies(analysisText),
        confidence: this.extractConfidence(analysisText),
        recommendations: this.extractRecommendations(analysisText),
        detailedAnalysis: analysisText,
        recommendedProducts: this.extractProducts(analysisText),
      };
    } catch (error) {
      logger.error('Failed to parse analysis response', { error });
      return {
        detectedDiseases: [],
        detectedDeficiencies: [],
        confidence: 0,
        recommendations: [],
        detailedAnalysis: analysisText,
        recommendedProducts: [],
      };
    }
  }

  /**
   * Extract diseases from text
   */
  private extractDiseases(text: string): string[] {
    const diseases: string[] = [];
    const diseaseKeywords = [
      'blight', 'rust', 'wilt', 'rot', 'mildew', 'spot', 'mosaic',
      'fungal', 'bacterial', 'viral', 'anthracnose', 'septoria',
    ];

    diseaseKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        diseases.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });

    return [...new Set(diseases)];
  }

  /**
   * Extract deficiencies from text
   */
  private extractDeficiencies(text: string): string[] {
    const deficiencies: string[] = [];
    const nutrients = [
      'nitrogen', 'phosphorus', 'potassium', 'calcium', 'magnesium',
      'iron', 'zinc', 'manganese', 'boron', 'copper',
    ];

    nutrients.forEach((nutrient) => {
      if (
        text.toLowerCase().includes(nutrient + ' deficiency') ||
        text.toLowerCase().includes('lack of ' + nutrient)
      ) {
        deficiencies.push(
          nutrient.charAt(0).toUpperCase() + nutrient.slice(1) + ' deficiency'
        );
      }
    });

    return [...new Set(deficiencies)];
  }

  /**
   * Extract confidence level
   */
  private extractConfidence(text: string): number {
    const confidenceMatch = text.match(/(\d+)%/);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1]) / 100;
    }
    return 0.7; // Default confidence
  }

  /**
   * Extract recommendations
   */
  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const lines = text.split('\n');

    lines.forEach((line) => {
      if (
        line.includes('recommend') ||
        line.includes('should') ||
        line.includes('apply') ||
        line.includes('spray') ||
        line.includes('treat')
      ) {
        const cleaned = line.replace(/^[-•*\d.]\s*/, '').trim();
        if (cleaned.length > 10) {
          recommendations.push(cleaned);
        }
      }
    });

    return recommendations.slice(0, 5);
  }

  /**
   * Extract product recommendations
   */
  private extractProducts(text: string): string[] {
    const products: string[] = [];
    const productKeywords = [
      'fungicide', 'pesticide', 'fertilizer', 'DAP', 'CAN', 'NPK',
      'urea', 'mancozeb', 'dimethoate', 'copper', 'sulfur',
    ];

    productKeywords.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        products.push(keyword.toUpperCase());
      }
    });

    return [...new Set(products)];
  }

  /**
   * Save image to storage
   */
  async saveImage(imageBuffer: Buffer, filename: string): Promise<string> {
    try {
      const imageDir = path.join(process.cwd(), 'uploads', 'plant_images');
      await fs.mkdir(imageDir, { recursive: true });

      const filePath = path.join(imageDir, filename);
      await fs.writeFile(filePath, imageBuffer);

      // Return public URL
      return `${process.env.BASE_URL}/uploads/plant_images/${filename}`;
    } catch (error) {
      logger.error('Failed to save image', { error });
      throw error;
    }
  }

  /**
   * Download image from URL
   */
  async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error) {
      logger.error('Failed to download image', { url, error });
      throw error;
    }
  }
}

export default new ImageAnalysisService();
