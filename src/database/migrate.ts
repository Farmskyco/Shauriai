import sequelize from '../config/database';
import User from '../models/User';
import CallSession from '../models/CallSession';
import Conversation from '../models/Conversation';
import Product from '../models/Product';
import Order from '../models/Order';
import logger from '../config/logger';

async function migrate() {
  try {
    logger.info('Starting database migration...');

    // Test connection
    await sequelize.authenticate();
    logger.info('Database connection successful');

    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    logger.info('Database models synchronized');

    logger.info('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed', { error });
    process.exit(1);
  }
}

migrate();
