import { Router } from 'express';
import whatsappController from '../controllers/whatsapp.controller';

const router = Router();

/**
 * WhatsApp webhook endpoints
 */

// Incoming message webhook (Africa's Talking)
router.post('/incoming', (req, res) => {
  whatsappController.handleIncomingMessage(req, res);
});

// Status/delivery callback (optional)
router.post('/status', (req, res) => {
  // Handle message delivery status
  res.status(200).send('OK');
});

export default router;
