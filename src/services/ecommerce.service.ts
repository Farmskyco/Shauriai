import Product from '../models/Product';
import Order from '../models/Order';
import User from '../models/User';
import logger from '../config/logger';
import { Op } from 'sequelize';

class EcommerceService {
  /**
   * Search for products based on query
   */
  async searchProducts(
    query: string,
    category?: string,
    language: string = 'en'
  ): Promise<Product[]> {
    try {
      const where: any = {
        isActive: true,
        stockQuantity: { [Op.gt]: 0 },
      };

      // Category filter
      if (category) {
        where.category = category;
      }

      // Language-specific name search
      const nameFields = ['name', 'nameSwahili', 'nameLuo', 'nameKikuyu'];
      const searchConditions = nameFields.map((field) => ({
        [field]: { [Op.iLike]: `%${query}%` },
      }));

      where[Op.or] = [
        ...searchConditions,
        { description: { [Op.iLike]: `%${query}%` } },
      ];

      const products = await Product.findAll({
        where,
        limit: 10,
        order: [['name', 'ASC']],
      });

      logger.info('Products searched', { query, count: products.length });
      return products;
    } catch (error) {
      logger.error('Product search error', { error });
      return [];
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const product = await Product.findByPk(productId);
      return product;
    } catch (error) {
      logger.error('Get product error', { productId, error });
      return null;
    }
  }

  /**
   * Get popular fertilizers
   */
  async getPopularFertilizers(limit: number = 5): Promise<Product[]> {
    try {
      const products = await Product.findAll({
        where: {
          category: 'fertilizer',
          isActive: true,
          stockQuantity: { [Op.gt]: 0 },
        },
        limit,
        order: [['name', 'ASC']],
      });

      return products;
    } catch (error) {
      logger.error('Get fertilizers error', { error });
      return [];
    }
  }

  /**
   * Create an order
   */
  async createOrder(params: {
    sessionId: string;
    userId: string;
    productId: string;
    quantity: number;
    deliveryAddress?: string;
    notes?: string;
  }): Promise<Order | null> {
    try {
      // Get product to check stock and price
      const product = await Product.findByPk(params.productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (product.stockQuantity < params.quantity) {
        throw new Error('Insufficient stock');
      }

      // Calculate total
      const unitPrice = parseFloat(product.price.toString());
      const totalPrice = unitPrice * params.quantity;

      // Create order
      const order = await Order.create({
        sessionId: params.sessionId,
        userId: params.userId,
        productId: params.productId,
        quantity: params.quantity,
        unitPrice,
        totalPrice,
        deliveryAddress: params.deliveryAddress,
        notes: params.notes,
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });

      // Update stock (optimistic)
      await product.update({
        stockQuantity: product.stockQuantity - params.quantity,
      });

      logger.info('Order created', { orderId: order.id, totalPrice });
      return order;
    } catch (error) {
      logger.error('Create order error', { error });
      return null;
    }
  }

  /**
   * Generate product description in specified language
   */
  getProductDescription(product: Product, language: string): string {
    const name =
      language === 'sw' && product.nameSwahili
        ? product.nameSwahili
        : language === 'luo' && product.nameLuo
        ? product.nameLuo
        : language === 'ki' && product.nameKikuyu
        ? product.nameKikuyu
        : product.name;

    const templates = {
      en: `${name} - KES ${product.price} per ${product.unit}. ${product.description}`,
      sw: `${name} - KES ${product.price} kwa ${product.unit}. ${product.description}`,
      luo: `${name} - KES ${product.price} per ${product.unit}. ${product.description}`,
      ki: `${name} - KES ${product.price} per ${product.unit}. ${product.description}`,
    };

    return templates[language as keyof typeof templates] || templates.en;
  }

  /**
   * Format order summary for SMS
   */
  formatOrderSummary(order: Order, product: Product, language: string): string {
    const templates = {
      en: `Order confirmed: ${product.name} x${order.quantity}. Total: KES ${order.totalPrice}. We'll call you for payment & delivery details.`,
      sw: `Oda imethibitishwa: ${product.nameSwahili || product.name} x${order.quantity}. Jumla: KES ${order.totalPrice}. Tutakupigia kwa maelezo ya malipo na utoaji.`,
      luo: `Order confirmed: ${product.name} x${order.quantity}. Total: KES ${order.totalPrice}. We'll call you for payment & delivery.`,
      ki: `Order confirmed: ${product.name} x${order.quantity}. Total: KES ${order.totalPrice}. We'll call you for payment & delivery.`,
    };

    return templates[language as keyof typeof templates] || templates.en;
  }

  /**
   * Initiate M-Pesa payment (placeholder)
   */
  async initiateMpesaPayment(
    phoneNumber: string,
    amount: number,
    orderId: string
  ): Promise<{ success: boolean; reference?: string }> {
    // This would integrate with Safaricom M-Pesa API
    // For now, return a mock response
    logger.info('M-Pesa payment initiated (mock)', {
      phoneNumber,
      amount,
      orderId,
    });

    // In production, implement actual M-Pesa STK Push
    return {
      success: true,
      reference: `MPESA-${Date.now()}`,
    };
  }
}

export default new EcommerceService();
