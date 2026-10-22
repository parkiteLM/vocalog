import * as Linking from 'expo-linking';

export type DeepLinkAction = 'record' | 'settings' | 'today' | 'unknown';

export class DeepLinkService {
  /**
   * Parses an incoming URL and determines the intended action.
   * Supports schemes:
   * - vocalog://record
   * - vocalog://settings
   * - vocalog://today
   */
  parseAction(url: string | null): DeepLinkAction {
    if (!url) return 'unknown';

    try {
      const parsed = Linking.parse(url);
      const hostname = parsed.hostname?.toLowerCase();
      const path = parsed.path?.toLowerCase();

      if (hostname === 'record' || path === 'record') {
        return 'record';
      }
      if (hostname === 'settings' || path === 'settings') {
        return 'settings';
      }
      if (hostname === 'today' || path === 'today') {
        return 'today';
      }

      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Subscribes to cold-start and background deep link events.
   */
  async initListener(onAction: (action: DeepLinkAction) => void): Promise<() => void> {
    // 1. Check initial URL if the app was launched from a cold start
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      const action = this.parseAction(initialUrl);
      if (action !== 'unknown') {
        onAction(action);
      }
    }

    // 2. Listen for deep link events while the app is active or in background
    const subscription = Linking.addEventListener('url', (event) => {
      const action = this.parseAction(event.url);
      if (action !== 'unknown') {
        onAction(action);
      }
    });

    return () => {
      subscription.remove();
    };
  }
}

export const deepLinkService = new DeepLinkService();
