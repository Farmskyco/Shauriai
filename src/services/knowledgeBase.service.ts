/**
 * Knowledge Base Service
 *
 * This service provides agricultural knowledge specific to Kenya.
 * In production, this would be connected to a comprehensive database
 * or vector store with detailed crop information, best practices, etc.
 */

interface CropInfo {
  name: string;
  nameSwahili: string;
  season: string;
  rainfall: string;
  soilType: string;
  fertilizer: string[];
  pests: string[];
  harvestTime: string;
}

class KnowledgeBaseService {
  private crops: Map<string, CropInfo> = new Map();
  private marketPrices: Map<string, number> = new Map();

  constructor() {
    this.initializeCrops();
    this.initializeMarketPrices();
  }

  /**
   * Initialize crop information
   */
  private initializeCrops() {
    const crops: CropInfo[] = [
      {
        name: 'Maize',
        nameSwahili: 'Mahindi',
        season: 'Long rains (March-May) and Short rains (October-December)',
        rainfall: '500-800mm per season',
        soilType: 'Well-drained loam soil, pH 5.5-7.0',
        fertilizer: ['DAP at planting', 'CAN top dressing at 3-4 weeks', 'NPK 17:17:17'],
        pests: ['Fall armyworm', 'Maize stalk borer', 'Aphids'],
        harvestTime: '3-4 months after planting',
      },
      {
        name: 'Beans',
        nameSwahili: 'Maharagwe',
        season: 'Long rains and Short rains',
        rainfall: '400-600mm per season',
        soilType: 'Well-drained loam, pH 6.0-7.5',
        fertilizer: ['DAP at planting', 'Minimal nitrogen (legume)'],
        pests: ['Bean fly', 'Aphids', 'Bean beetles'],
        harvestTime: '2-3 months after planting',
      },
      {
        name: 'Potatoes',
        nameSwahili: 'Viazi',
        season: 'Cool season, best in highlands',
        rainfall: '500-700mm per season',
        soilType: 'Sandy loam, well-drained, pH 5.2-6.4',
        fertilizer: ['NPK 17:17:17 at planting', 'CAN top dressing'],
        pests: ['Potato tuber moth', 'Late blight', 'Early blight'],
        harvestTime: '3-4 months after planting',
      },
      {
        name: 'Tomatoes',
        nameSwahili: 'Nyanya',
        season: 'Year-round with irrigation',
        rainfall: '400-600mm, supplemented with irrigation',
        soilType: 'Well-drained loam, pH 6.0-7.0',
        fertilizer: ['NPK 23:23:0 at planting', 'Foliar feed with micronutrients'],
        pests: ['Whiteflies', 'Tomato leaf miner', 'Early and late blight'],
        harvestTime: '3-4 months after transplanting',
      },
      {
        name: 'Coffee',
        nameSwahili: 'Kahawa',
        season: 'Perennial, flowers after long rains',
        rainfall: '1000-2000mm annually',
        soilType: 'Deep, well-drained volcanic soil, pH 5.0-6.0',
        fertilizer: ['NPK 26:5:5 during growing season', 'Foliar sprays'],
        pests: ['Coffee berry disease', 'Coffee leaf rust', 'Antestia bugs'],
        harvestTime: 'Cherry season: Oct-Dec (early crop), May-Jul (main crop)',
      },
      {
        name: 'Tea',
        nameSwahili: 'Chai',
        season: 'Perennial, continuous harvesting',
        rainfall: '1200-1400mm annually, evenly distributed',
        soilType: 'Deep acidic soil, pH 4.5-5.5',
        fertilizer: ['NPK 26:5:5', 'Sulphate of ammonia'],
        pests: ['Tea mosquito bug', 'Thrips', 'Scale insects'],
        harvestTime: 'Year-round plucking every 7-14 days',
      },
    ];

    crops.forEach((crop) => {
      this.crops.set(crop.name.toLowerCase(), crop);
      this.crops.set(crop.nameSwahili.toLowerCase(), crop);
    });
  }

  /**
   * Initialize market prices (mock data - in production, fetch from API)
   */
  private initializeMarketPrices() {
    // Prices in KES per kg
    this.marketPrices.set('maize', 45);
    this.marketPrices.set('beans', 120);
    this.marketPrices.set('potatoes', 55);
    this.marketPrices.set('tomatoes', 60);
    this.marketPrices.set('coffee', 80); // per kg cherry
    this.marketPrices.set('tea', 50); // per kg green leaf
  }

  /**
   * Get crop information
   */
  getCropInfo(cropName: string): CropInfo | null {
    return this.crops.get(cropName.toLowerCase()) || null;
  }

  /**
   * Get market price for a crop
   */
  getMarketPrice(cropName: string): number | null {
    return this.marketPrices.get(cropName.toLowerCase()) || null;
  }

  /**
   * Get context snippets for Claude
   */
  getContextSnippets(): string {
    return `Common Kenyan crops and basic info:
- Maize (Mahindi): Main staple, needs 500-800mm rain, fertilize with DAP and CAN
- Beans (Maharagwe): 2-3 months to harvest, minimal fertilizer needed (legume)
- Potatoes (Viazi): Best in highlands, watch for late blight
- Coffee (Kahawa): Altitude 1400-2100m, needs acidic soil
- Tea (Chai): Continuous harvest, acidic soil pH 4.5-5.5

Common fertilizers in Kenya:
- DAP (Diammonium Phosphate) 18-46-0
- CAN (Calcium Ammonium Nitrate) 26-0-0
- NPK 17:17:17 (balanced)
- NPK 23:23:0 (for vegetables)

Kenyan seasons:
- Long rains: March to May
- Short rains: October to December
- Plant maize and beans at start of rains`;
  }

  /**
   * Search for relevant information
   */
  search(query: string): string[] {
    const results: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Search crops
    this.crops.forEach((crop, key) => {
      if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
        results.push(`${crop.name} (${crop.nameSwahili}): ${crop.fertilizer.join(', ')}`);
      }
    });

    return results;
  }
}

export default new KnowledgeBaseService();
