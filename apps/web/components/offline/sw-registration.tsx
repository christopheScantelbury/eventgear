'use client';

import { useEffect } from 'react';

/**
 * Registra o Service Worker do Serwist (gerado em /sw.js no build).
 * - Em dev, o serwist está desabilitado, então este registro é noop.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[SW] registration failed:', err);
      }
    };

    if (document.readyState === 'complete') {
      void register();
    } else {
      window.addEventListener('load', () => { void register(); }, { once: true });
    }
  }, []);

  return null;
}
