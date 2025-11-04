import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';
import logger from '../config/logger';

class SpeechService {
  private speechConfig: sdk.SpeechConfig;

  constructor() {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
      throw new Error('Azure Speech credentials not configured');
    }

    this.speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
  }

  /**
   * Convert speech to text
   */
  async speechToText(audioUrl: string, language: string): Promise<string> {
    try {
      // Download audio file
      const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      const audioBuffer = Buffer.from(response.data);

      // Map language codes to Azure Speech language codes
      const languageMap: { [key: string]: string } = {
        en: 'en-US',
        sw: 'sw-KE', // Swahili (Kenya)
        luo: 'sw-KE', // Fallback to Swahili for Luo (not natively supported)
        ki: 'sw-KE', // Fallback to Swahili for Kikuyu (not natively supported)
      };

      const azureLanguage = languageMap[language] || 'en-US';
      this.speechConfig.speechRecognitionLanguage = azureLanguage;

      // Create audio config from buffer
      const pushStream = sdk.AudioInputStream.createPushStream();
      pushStream.write(audioBuffer);
      pushStream.close();

      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
      const recognizer = sdk.SpeechRecognizer.fromConfig(this.speechConfig, audioConfig);

      return new Promise((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          (result) => {
            if (result.reason === sdk.ResultReason.RecognizedSpeech) {
              logger.info('Speech recognized', { text: result.text, language: azureLanguage });
              resolve(result.text);
            } else {
              logger.warn('Speech recognition failed', { reason: result.reason });
              reject(new Error('Speech not recognized'));
            }
            recognizer.close();
          },
          (error) => {
            logger.error('Speech recognition error', { error });
            recognizer.close();
            reject(error);
          }
        );
      });
    } catch (error) {
      logger.error('STT processing failed', { error });
      throw error;
    }
  }

  /**
   * Convert text to speech and return audio buffer
   */
  async textToSpeech(text: string, language: string): Promise<Buffer> {
    try {
      // Map language codes to Azure Speech voice names
      const voiceMap: { [key: string]: string } = {
        en: 'en-US-JennyNeural',
        sw: 'sw-KE-ZuriNeural', // Swahili (Kenya) female voice
        luo: 'sw-KE-ZuriNeural', // Fallback to Swahili
        ki: 'sw-KE-ZuriNeural', // Fallback to Swahili
      };

      const voiceName = voiceMap[language] || 'en-US-JennyNeural';
      this.speechConfig.speechSynthesisVoiceName = voiceName;

      const synthesizer = sdk.SpeechSynthesizer.fromConfig(this.speechConfig);

      return new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(
          text,
          (result) => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              logger.info('Speech synthesis completed', { language, voiceName });
              const audioBuffer = Buffer.from(result.audioData);
              resolve(audioBuffer);
            } else {
              logger.warn('Speech synthesis failed', { reason: result.reason });
              reject(new Error('Speech synthesis failed'));
            }
            synthesizer.close();
          },
          (error) => {
            logger.error('Speech synthesis error', { error });
            synthesizer.close();
            reject(error);
          }
        );
      });
    } catch (error) {
      logger.error('TTS processing failed', { error });
      throw error;
    }
  }

  /**
   * Save audio buffer to file (for caching)
   */
  async saveAudioFile(buffer: Buffer, filename: string): Promise<string> {
    const fs = require('fs').promises;
    const path = require('path');

    const audioDir = path.join(process.cwd(), 'audio_cache');
    await fs.mkdir(audioDir, { recursive: true });

    const filePath = path.join(audioDir, filename);
    await fs.writeFile(filePath, buffer);

    // Return public URL
    return `${process.env.BASE_URL}/audio/${filename}`;
  }
}

export default new SpeechService();
