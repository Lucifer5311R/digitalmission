export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('New service worker activated');
            }
          });
        }
      });

      // When coming back online, tell the SW to replay queued mutations
      window.addEventListener('online', async () => {
        const sw = await navigator.serviceWorker.ready;
        if (sw.active) {
          sw.active.postMessage('REPLAY_QUEUE');
        }
      });

      // Listen for sync complete messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SYNC_COMPLETE') {
          // Dispatch a custom event so React components can refresh
          window.dispatchEvent(new CustomEvent('sw-sync-complete'));
        }
      });

      console.log('Service Worker registered:', registration.scope);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
  }
}

