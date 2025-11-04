/**
 * Disease Knowledge Base Service
 *
 * Comprehensive database of common plant diseases, deficiencies,
 * and treatments for Kenyan agriculture
 */

interface DiseaseInfo {
  name: string;
  nameSwahili: string;
  crops: string[];
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
  recommendedProducts: string[];
}

interface DeficiencyInfo {
  nutrient: string;
  nameSwahili: string;
  symptoms: string[];
  treatment: string[];
  recommendedFertilizers: string[];
}

class DiseaseKnowledgeService {
  private diseases: Map<string, DiseaseInfo> = new Map();
  private deficiencies: Map<string, DeficiencyInfo> = new Map();

  constructor() {
    this.initializeDiseases();
    this.initializeDeficiencies();
  }

  /**
   * Initialize common plant diseases in Kenya
   */
  private initializeDiseases() {
    const diseases: DiseaseInfo[] = [
      {
        name: 'Late Blight',
        nameSwahili: 'Ugonjwa wa Kuvu',
        crops: ['potato', 'tomato'],
        symptoms: [
          'Dark brown spots on leaves',
          'White fungal growth on leaf undersides',
          'Stem lesions',
          'Fruit rot',
        ],
        causes: ['Phytophthora infestans fungus', 'Cool, wet conditions'],
        treatment: [
          'Apply Mancozeb fungicide immediately',
          'Use Copper-based fungicides',
          'Remove and destroy infected plants',
          'Improve air circulation',
        ],
        prevention: [
          'Plant resistant varieties',
          'Avoid overhead irrigation',
          'Apply preventive fungicides',
          'Maintain proper plant spacing',
        ],
        recommendedProducts: ['Mancozeb', 'Ridomil Gold', 'Copper Oxychloride'],
      },
      {
        name: 'Coffee Berry Disease',
        nameSwahili: 'Ugonjwa wa Tunda la Kahawa',
        crops: ['coffee'],
        symptoms: [
          'Dark sunken lesions on berries',
          'Premature berry drop',
          'Blackened berries',
        ],
        causes: ['Colletotrichum kahawae fungus', 'High rainfall'],
        treatment: [
          'Apply copper-based fungicides',
          'Remove infected berries',
          'Spray during flowering',
        ],
        prevention: [
          'Regular pruning',
          'Proper spacing',
          'Timely fungicide application',
        ],
        recommendedProducts: ['Copper Fungicides', 'Thiovit', 'Milraz'],
      },
      {
        name: 'Maize Streak Virus',
        nameSwahili: 'Virusi ya Mistari ya Mahindi',
        crops: ['maize'],
        symptoms: [
          'Yellow streaks on leaves',
          'Stunted growth',
          'Reduced yield',
        ],
        causes: ['Leafhopper transmission', 'Viral infection'],
        treatment: [
          'Control leafhopper vectors',
          'Remove infected plants',
          'No chemical cure for virus',
        ],
        prevention: [
          'Plant resistant varieties',
          'Early planting',
          'Control leafhoppers with insecticides',
        ],
        recommendedProducts: ['Dimethoate', 'Cypermethrin', 'Lambda-cyhalothrin'],
      },
      {
        name: 'Bacterial Wilt',
        nameSwahili: 'Ugonjwa wa Kunyauka',
        crops: ['tomato', 'potato', 'banana'],
        symptoms: [
          'Sudden wilting of plants',
          'Yellowing leaves',
          'Brown vascular tissue',
          'Slimy stem discharge',
        ],
        causes: ['Ralstonia solanacearum bacteria', 'Contaminated soil/water'],
        treatment: [
          'Remove and burn infected plants',
          'Soil fumigation',
          'Crop rotation',
        ],
        prevention: [
          'Use clean planting material',
          'Avoid waterlogging',
          'Practice crop rotation',
          'Disinfect tools',
        ],
        recommendedProducts: ['Copper bactericides', 'Soil fumigants'],
      },
      {
        name: 'Fall Armyworm',
        nameSwahili: 'Mdudu wa Jeshi la Kuanguka',
        crops: ['maize', 'sorghum'],
        symptoms: [
          'Holes in leaves',
          'Damage to whorl',
          'Visible larvae',
          'Frass (insect waste)',
        ],
        causes: ['Spodoptera frugiperda caterpillar'],
        treatment: [
          'Apply insecticides when larvae are young',
          'Handpick and destroy larvae',
          'Use biological control (Bt)',
        ],
        prevention: [
          'Early planting',
          'Regular scouting',
          'Intercropping with legumes',
          'Use of pheromone traps',
        ],
        recommendedProducts: [
          'Chlorantraniliprole',
          'Emamectin benzoate',
          'Bacillus thuringiensis',
        ],
      },
      {
        name: 'Powdery Mildew',
        nameSwahili: 'Ukungu Mweupe',
        crops: ['tomato', 'beans', 'cucurbits'],
        symptoms: [
          'White powdery coating on leaves',
          'Leaf yellowing',
          'Stunted growth',
        ],
        causes: ['Various fungal species', 'Warm, dry days with cool nights'],
        treatment: [
          'Apply sulfur-based fungicides',
          'Neem oil spray',
          'Remove infected leaves',
        ],
        prevention: [
          'Proper spacing',
          'Avoid overhead watering',
          'Plant resistant varieties',
        ],
        recommendedProducts: ['Sulfur', 'Thiovit', 'Neem oil'],
      },
      {
        name: 'Aphid Infestation',
        nameSwahili: 'Uvamizi wa Viwavi',
        crops: ['most crops'],
        symptoms: [
          'Curled leaves',
          'Sticky honeydew on leaves',
          'Presence of small insects',
          'Sooty mold',
        ],
        causes: ['Various aphid species'],
        treatment: [
          'Spray with insecticides',
          'Use soapy water solution',
          'Introduce beneficial insects',
        ],
        prevention: [
          'Regular monitoring',
          'Yellow sticky traps',
          'Companion planting',
        ],
        recommendedProducts: ['Dimethoate', 'Imidacloprid', 'Neem oil'],
      },
    ];

    diseases.forEach((disease) => {
      this.diseases.set(disease.name.toLowerCase(), disease);
    });
  }

  /**
   * Initialize nutrient deficiencies
   */
  private initializeDeficiencies() {
    const deficiencies: DeficiencyInfo[] = [
      {
        nutrient: 'Nitrogen',
        nameSwahili: 'Naitrojeni',
        symptoms: [
          'Yellowing of older leaves (chlorosis)',
          'Stunted growth',
          'Pale green color overall',
          'Reduced leaf size',
        ],
        treatment: [
          'Apply nitrogen fertilizers',
          'Use organic matter',
          'Apply urea or CAN',
        ],
        recommendedFertilizers: ['Urea (46-0-0)', 'CAN (26-0-0)', 'NPK blends'],
      },
      {
        nutrient: 'Phosphorus',
        nameSwahili: 'Fosforasi',
        symptoms: [
          'Dark green or purplish leaves',
          'Stunted growth',
          'Delayed maturity',
          'Poor root development',
        ],
        treatment: [
          'Apply phosphate fertilizers',
          'Use DAP at planting',
          'Add bone meal',
        ],
        recommendedFertilizers: ['DAP (18-46-0)', 'TSP', 'Rock phosphate'],
      },
      {
        nutrient: 'Potassium',
        nameSwahili: 'Potasiamu',
        symptoms: [
          'Brown leaf edges (marginal necrosis)',
          'Weak stems',
          'Poor fruit quality',
          'Increased disease susceptibility',
        ],
        treatment: [
          'Apply potassium fertilizers',
          'Use wood ash',
          'Apply NPK with high K',
        ],
        recommendedFertilizers: ['Muriate of Potash', 'NPK 17:17:17', 'NPK 23:23:0'],
      },
      {
        nutrient: 'Iron',
        nameSwahili: 'Chuma',
        symptoms: [
          'Yellowing between leaf veins (interveinal chlorosis)',
          'New leaves affected first',
          'Leaf whitening in severe cases',
        ],
        treatment: [
          'Foliar spray with iron chelates',
          'Correct soil pH',
          'Improve drainage',
        ],
        recommendedFertilizers: ['Iron chelate (Fe-EDTA)', 'Ferrous sulfate'],
      },
      {
        nutrient: 'Magnesium',
        nameSwahili: 'Magnesiamu',
        symptoms: [
          'Yellowing between veins on older leaves',
          'Reddish-purple tints',
          'Leaf curling',
        ],
        treatment: [
          'Apply Epsom salt (magnesium sulfate)',
          'Use dolomitic limestone',
          'Foliar spray',
        ],
        recommendedFertilizers: ['Epsom salt', 'Dolomite', 'Kieserite'],
      },
      {
        nutrient: 'Calcium',
        nameSwahili: 'Kalisiamu',
        symptoms: [
          'Blossom end rot in tomatoes',
          'Tip burn in lettuce',
          'Stunted root growth',
          'New leaves distorted',
        ],
        treatment: [
          'Apply calcium nitrate',
          'Use agricultural lime',
          'Ensure consistent watering',
        ],
        recommendedFertilizers: ['Calcium nitrate', 'Gypsum', 'Lime'],
      },
      {
        nutrient: 'Zinc',
        nameSwahili: 'Zinki',
        symptoms: [
          'Small leaves (little leaf)',
          'Short internodes',
          'Interveinal chlorosis',
          'Stunted growth',
        ],
        treatment: [
          'Foliar spray with zinc sulfate',
          'Apply zinc fertilizers to soil',
        ],
        recommendedFertilizers: ['Zinc sulfate', 'Zinc chelate'],
      },
    ];

    deficiencies.forEach((def) => {
      this.deficiencies.set(def.nutrient.toLowerCase(), def);
    });
  }

  /**
   * Get disease information
   */
  getDiseaseInfo(diseaseName: string): DiseaseInfo | null {
    return this.diseases.get(diseaseName.toLowerCase()) || null;
  }

  /**
   * Get deficiency information
   */
  getDeficiencyInfo(nutrient: string): DeficiencyInfo | null {
    return this.deficiencies.get(nutrient.toLowerCase()) || null;
  }

  /**
   * Search for diseases by symptoms
   */
  searchBySymptoms(symptoms: string[]): DiseaseInfo[] {
    const matches: DiseaseInfo[] = [];

    this.diseases.forEach((disease) => {
      const symptomMatch = symptoms.some((symptom) =>
        disease.symptoms.some((s) =>
          s.toLowerCase().includes(symptom.toLowerCase())
        )
      );

      if (symptomMatch) {
        matches.push(disease);
      }
    });

    return matches;
  }

  /**
   * Get treatment recommendations
   */
  getTreatmentRecommendations(
    diseases: string[],
    deficiencies: string[]
  ): {
    treatments: string[];
    products: string[];
  } {
    const treatments: Set<string> = new Set();
    const products: Set<string> = new Set();

    // Add disease treatments
    diseases.forEach((disease) => {
      const info = this.getDiseaseInfo(disease);
      if (info) {
        info.treatment.forEach((t) => treatments.add(t));
        info.recommendedProducts.forEach((p) => products.add(p));
      }
    });

    // Add deficiency treatments
    deficiencies.forEach((deficiency) => {
      const nutrient = deficiency.replace(' deficiency', '');
      const info = this.getDeficiencyInfo(nutrient);
      if (info) {
        info.treatment.forEach((t) => treatments.add(t));
        info.recommendedFertilizers.forEach((p) => products.add(p));
      }
    });

    return {
      treatments: Array.from(treatments),
      products: Array.from(products),
    };
  }

  /**
   * Get all diseases
   */
  getAllDiseases(): DiseaseInfo[] {
    return Array.from(this.diseases.values());
  }

  /**
   * Get all deficiencies
   */
  getAllDeficiencies(): DeficiencyInfo[] {
    return Array.from(this.deficiencies.values());
  }
}

export default new DiseaseKnowledgeService();
