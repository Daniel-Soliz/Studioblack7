import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

declare global {
  interface Window {
    __sb7InstallPrompt?: Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    };
  }
}

// Capture the install event as early as possible, before React mounts.
// Some Android/Chrome versions may fire it before Header's effect runs.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  window.__sb7InstallPrompt = event as Window['__sb7InstallPrompt'];
  window.dispatchEvent(new CustomEvent('sb7-install-ready'));
});

window.addEventListener('appinstalled', () => {
  window.__sb7InstallPrompt = undefined;
  window.dispatchEvent(new CustomEvent('sb7-app-installed'));
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: import.meta.env.BASE_URL,
      });
      await registration.update();
    } catch (error) {
      console.warn('Não foi possível registrar o aplicativo instalável:', error);
    }
  });
}
