import { DeepLinkService } from '../src/core/services/DeepLinkService';
import * as Linking from 'expo-linking';

jest.mock('expo-linking', () => {
  let urlListener: ((event: { url: string }) => void) | null = null;
  return {
    parse: jest.fn((url: string) => {
      if (!url) return {};
      // simple parser simulation
      const cleaned = url.replace('vocalog://', '').replace(/^\/+/, '');
      const parts = cleaned.split('/');
      const hostname = parts[0] || '';
      const path = parts.slice(1).join('/') || parts[0] || '';
      return { hostname, path };
    }),
    getInitialURL: jest.fn().mockResolvedValue(null),
    addEventListener: jest.fn((event: string, callback: (e: { url: string }) => void) => {
      urlListener = callback;
      return {
        remove: jest.fn(() => {
          urlListener = null;
        }),
      };
    }),
    _simulateUrlEvent: (url: string) => {
      if (urlListener) {
        urlListener({ url });
      }
    },
  };
});

describe('DeepLinkService', () => {
  let service: DeepLinkService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DeepLinkService();
  });

  describe('parseAction', () => {
    it('returns "record" for vocalog://record', () => {
      expect(service.parseAction('vocalog://record')).toBe('record');
    });

    it('returns "settings" for vocalog://settings', () => {
      expect(service.parseAction('vocalog://settings')).toBe('settings');
    });

    it('returns "today" for vocalog://today', () => {
      expect(service.parseAction('vocalog://today')).toBe('today');
    });

    it('returns "unknown" for null or empty string', () => {
      expect(service.parseAction(null)).toBe('unknown');
      expect(service.parseAction('')).toBe('unknown');
    });

    it('returns "unknown" for unrecognized deep link', () => {
      expect(service.parseAction('vocalog://unknown-action')).toBe('unknown');
      expect(service.parseAction('https://google.com')).toBe('unknown');
    });
  });

  describe('initListener', () => {
    it('dispatches action if initialUrl is present at cold start', async () => {
      (Linking.getInitialURL as jest.Mock).mockResolvedValueOnce('vocalog://record');

      const actionHandler = jest.fn();
      const unsubscribe = await service.initListener(actionHandler);

      expect(Linking.getInitialURL).toHaveBeenCalledTimes(1);
      expect(actionHandler).toHaveBeenCalledWith('record');

      unsubscribe();
    });

    it('listens for runtime url events and unsubscribes properly', async () => {
      const actionHandler = jest.fn();
      const unsubscribe = await service.initListener(actionHandler);

      // Simulate runtime deep link event
      (Linking as any)._simulateUrlEvent('vocalog://settings');
      expect(actionHandler).toHaveBeenCalledWith('settings');

      unsubscribe();
    });

    it('ignores unknown deep link actions from runtime events', async () => {
      const actionHandler = jest.fn();
      const unsubscribe = await service.initListener(actionHandler);

      (Linking as any)._simulateUrlEvent('vocalog://invalid-path');
      expect(actionHandler).not.toHaveBeenCalled();

      unsubscribe();
    });
  });
});
