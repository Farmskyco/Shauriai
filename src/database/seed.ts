import Product from '../models/Product';
import logger from '../config/logger';

/**
 * Seed database with sample products
 */
async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Seed fertilizers
    const fertilizers = [
      {
        name: 'DAP Fertilizer',
        nameSwahili: 'Mbolea ya DAP',
        category: 'fertilizer' as const,
        description: 'Di-ammonium Phosphate (DAP) 18-46-0. Best for planting time.',
        price: 4500,
        unit: '50kg bag',
        stockQuantity: 100,
        manufacturer: 'Yara Kenya',
        isActive: true,
      },
      {
        name: 'CAN Fertilizer',
        nameSwahili: 'Mbolea ya CAN',
        category: 'fertilizer' as const,
        description: 'Calcium Ammonium Nitrate (CAN) 26-0-0. For top dressing.',
        price: 3800,
        unit: '50kg bag',
        stockQuantity: 150,
        manufacturer: 'Yara Kenya',
        isActive: true,
      },
      {
        name: 'NPK 17:17:17',
        nameSwahili: 'Mbolea ya NPK 17:17:17',
        category: 'fertilizer' as const,
        description: 'Balanced NPK fertilizer for general use.',
        price: 4200,
        unit: '50kg bag',
        stockQuantity: 120,
        manufacturer: 'MEA Limited',
        isActive: true,
      },
      {
        name: 'NPK 23:23:0',
        nameSwahili: 'Mbolea ya NPK 23:23:0',
        category: 'fertilizer' as const,
        description: 'High nitrogen and phosphorus for vegetables.',
        price: 4800,
        unit: '50kg bag',
        stockQuantity: 80,
        manufacturer: 'MEA Limited',
        isActive: true,
      },
      {
        name: 'Urea Fertilizer',
        nameSwahili: 'Mbolea ya Urea',
        category: 'fertilizer' as const,
        description: 'Urea 46-0-0. High nitrogen fertilizer.',
        price: 3500,
        unit: '50kg bag',
        stockQuantity: 200,
        manufacturer: 'MEA Limited',
        isActive: true,
      },
    ];

    for (const fertilizer of fertilizers) {
      await Product.create(fertilizer);
      logger.info(`Seeded product: ${fertilizer.name}`);
    }

    // Seed pesticides
    const pesticides = [
      {
        name: 'Dimethoate Insecticide',
        nameSwahili: 'Dawa ya wadudu Dimethoate',
        category: 'pesticide' as const,
        description: 'Systemic insecticide for aphids, whiteflies, and thrips.',
        price: 850,
        unit: '1 liter',
        stockQuantity: 50,
        isActive: true,
      },
      {
        name: 'Mancozeb Fungicide',
        nameSwahili: 'Dawa ya kuvu Mancozeb',
        category: 'pesticide' as const,
        description: 'Protective fungicide for late blight and other diseases.',
        price: 1200,
        unit: '1 kg',
        stockQuantity: 60,
        isActive: true,
      },
    ];

    for (const pesticide of pesticides) {
      await Product.create(pesticide);
      logger.info(`Seeded product: ${pesticide.name}`);
    }

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', { error });
    process.exit(1);
  }
}

// Run seeder
seed();
