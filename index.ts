import { registerRootComponent } from 'expo';

// Prevent unhandled async errors from crashing the app process silently in release builds
const g = globalThis as any;
const originalHandler = g.ErrorUtils?.getGlobalHandler?.();
if (g.ErrorUtils) {
  g.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    console.error('Global ErrorUtils caught error (fatal=' + isFatal + '):', error);
    if (originalHandler) {
      originalHandler(error, false); // Treat as non-fatal to keep process alive
    }
  });
}

import App from './App';

registerRootComponent(App);
