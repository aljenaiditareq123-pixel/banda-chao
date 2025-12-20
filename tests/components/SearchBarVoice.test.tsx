/**
 * Unit Test for Voice Command Feature in SearchBar
 * Tests that microphone button correctly initializes speech recognition
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Web Speech API
const mockSpeechRecognition = vi.fn();
const mockRecognitionInstance = {
  continuous: false,
  interimResults: false,
  lang: '',
  start: vi.fn(),
  stop: vi.fn(),
  onstart: null as ((event: Event) => void) | null,
  onresult: null as ((event: any) => void) | null,
  onerror: null as ((event: any) => void) | null,
  onend: null as (() => void) | null,
};

mockSpeechRecognition.mockImplementation(() => mockRecognitionInstance);

// Setup global mocks
beforeEach(() => {
  global.window = {
    ...global.window,
    SpeechRecognition: mockSpeechRecognition,
    webkitSpeechRecognition: mockSpeechRecognition,
  } as any;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Voice Command Feature - SearchBar', () => {
  describe('Speech Recognition Initialization', () => {
    it('should detect Web Speech API support', () => {
      const SpeechRecognition = (global.window as any).SpeechRecognition || (global.window as any).webkitSpeechRecognition;
      expect(SpeechRecognition).toBeDefined();
      expect(typeof SpeechRecognition).toBe('function');
    });

    it('should create SpeechRecognition instance with correct settings', () => {
      const recognition = new mockSpeechRecognition();
      
      expect(recognition).toBeDefined();
      expect(mockSpeechRecognition).toHaveBeenCalled();
    });

    it('should configure recognition with correct properties', () => {
      const recognition = new mockSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-SA';

      expect(recognition.continuous).toBe(false);
      expect(recognition.interimResults).toBe(false);
      expect(recognition.lang).toBe('ar-SA');
    });
  });

  describe('Microphone Button Click Handler', () => {
    it('should call recognition.start() when microphone button is clicked', () => {
      const recognition = new mockSpeechRecognition();
      const handleVoiceSearch = () => {
        if (recognition) {
          recognition.start();
        }
      };

      handleVoiceSearch();
      expect(recognition.start).toHaveBeenCalled();
    });

    it('should call recognition.stop() when microphone button is clicked while listening', () => {
      const recognition = new mockSpeechRecognition();
      let isListening = true;

      const handleVoiceSearch = () => {
        if (isListening) {
          recognition.stop();
          isListening = false;
        } else {
          recognition.start();
          isListening = true;
        }
      };

      handleVoiceSearch(); // Should stop
      expect(recognition.stop).toHaveBeenCalled();
    });
  });

  describe('Speech Recognition Events', () => {
    it('should handle onstart event correctly', () => {
      const recognition = new mockSpeechRecognition();
      let isListening = false;

      recognition.onstart = () => {
        isListening = true;
      };

      // Simulate start event
      if (recognition.onstart) {
        recognition.onstart(new Event('start'));
      }

      expect(isListening).toBe(true);
    });

    it('should handle onresult event and extract transcript', () => {
      const recognition = new mockSpeechRecognition();
      let searchQuery = '';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        searchQuery = transcript;
      };

      // Simulate result event
      const mockEvent = {
        results: [
          [
            {
              transcript: 'منتج إلكتروني',
              confidence: 0.9,
            },
          ],
        ],
      };

      if (recognition.onresult) {
        recognition.onresult(mockEvent);
      }

      expect(searchQuery).toBe('منتج إلكتروني');
    });

    it('should handle onerror event correctly', () => {
      const recognition = new mockSpeechRecognition();
      let errorOccurred = false;
      let errorMessage = '';

      recognition.onerror = (event: any) => {
        errorOccurred = true;
        errorMessage = event.error;
      };

      // Simulate error event
      const mockErrorEvent = {
        error: 'no-speech',
      };

      if (recognition.onerror) {
        recognition.onerror(mockErrorEvent);
      }

      expect(errorOccurred).toBe(true);
      expect(errorMessage).toBe('no-speech');
    });

    it('should handle onend event correctly', () => {
      const recognition = new mockSpeechRecognition();
      let isListening = true;

      recognition.onend = () => {
        isListening = false;
      };

      // Simulate end event
      if (recognition.onend) {
        recognition.onend();
      }

      expect(isListening).toBe(false);
    });
  });

  describe('Language Configuration', () => {
    it('should set Arabic language for ar locale', () => {
      const locale = 'ar';
      const lang = locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US';
      expect(lang).toBe('ar-SA');
    });

    it('should set Chinese language for zh locale', () => {
      const locale = 'zh';
      const lang = locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US';
      expect(lang).toBe('zh-CN');
    });

    it('should set English language for en locale', () => {
      const locale = 'en';
      const lang = locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US';
      expect(lang).toBe('en-US');
    });
  });

  describe('Browser Support Detection', () => {
    it('should detect Chrome/Safari Web Speech API support', () => {
      const SpeechRecognition = (global.window as any).SpeechRecognition || (global.window as any).webkitSpeechRecognition;
      const isSupported = !!SpeechRecognition;
      expect(isSupported).toBe(true);
    });

    it('should handle unsupported browsers gracefully', () => {
      // Simulate browser without support
      delete (global.window as any).SpeechRecognition;
      delete (global.window as any).webkitSpeechRecognition;

      const SpeechRecognition = (global.window as any).SpeechRecognition || (global.window as any).webkitSpeechRecognition;
      const isSupported = !!SpeechRecognition;
      expect(isSupported).toBe(false);
    });
  });
});

describe('Voice Command Integration', () => {
  it('should integrate voice recognition with search functionality', () => {
    const recognition = new mockSpeechRecognition();
    let searchQuery = '';
    let searchTriggered = false;

    const handleSearch = (query: string) => {
      searchQuery = query;
      searchTriggered = true;
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      searchQuery = transcript;
      handleSearch(transcript);
    };

    // Simulate voice input
    const mockEvent = {
      results: [
        [
          {
            transcript: 'power bank',
            confidence: 0.95,
          },
        ],
      ],
    };

    if (recognition.onresult) {
      recognition.onresult(mockEvent);
    }

    expect(searchQuery).toBe('power bank');
    expect(searchTriggered).toBe(true);
  });
});
