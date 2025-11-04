import { Router } from 'express';
import voiceController from '../controllers/voice.controller';

const router = Router();

/**
 * Africa's Talking Voice Webhooks
 */

// Incoming call webhook
router.post('/at/voice', (req, res) => {
  voiceController.handleIncomingCall(req, res);
});

// Language selection callback
router.post('/at/language-selected', (req, res) => {
  voiceController.handleLanguageSelection(req, res);
});

// Main menu callback
router.post('/at/menu-selected', (req, res) => {
  voiceController.handleMenuSelection(req, res);
});

// Recording complete callback
router.post('/at/recording-complete', (req, res) => {
  voiceController.handleRecordingComplete(req, res);
});

// Continue conversation callback
router.post('/at/continue-conversation', (req, res) => {
  voiceController.handleContinueConversation(req, res);
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
