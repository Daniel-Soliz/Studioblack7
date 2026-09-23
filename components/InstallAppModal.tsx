import React, { useEffect, useMemo, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallAppModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => (window.__sb7InstallPrompt as BeforeInstallPromptEvent | undefined) ?? null
  );
  const [message, setMessage] = useState('');

  const isStandalone = useMemo(
    () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true,
    []
  );

  useEffect(() => {
    if (isStandalone) return;

    const isAdmin = window.location.pathname.includes('/admin');
    if (!isAdmin) setVisible(true);

    const syncPrompt = () => {
      const promptEvent = window.__sb7InstallPrompt as BeforeInstallPromptEvent | undefined;
      if (promptEvent) {
        setInstallPrompt(promptEvent);
        setMessage('');
      }
    };

    const handleInstalled = () => {
      setVisible(false);
      setInstallPrompt(null);
    };

    window.addEventListener('sb7-install-ready', syncPrompt);
    window.addEventListener('sb7-app-installed', handleInstalled);
    window.addEventListener('appinstalled', handleInstalled);
    syncPrompt();

    return () => {
      window.removeEventListener('sb7-install-ready', syncPrompt);
      window.removeEventListener('sb7-app-installed', handleInstalled);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [isStandalone]);

  const install = async () => {
    const promptEvent =
      installPrompt ||
      (window.__sb7InstallPrompt as BeforeInstallPromptEvent | undefined) ||
      null;

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const result = await promptEvent.userChoice;
        if (result.outcome === 'accepted') {
          setMessage('Instalação iniciada.');
        } else {
          setMessage('Instalação cancelada.');
        }
        window.__sb7InstallPrompt = undefined;
        setInstallPrompt(null);
      } catch {
        setMessage('O Chrome não conseguiu abrir a instalação agora.');
      }
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setMessage('No iPhone, use Compartilhar → Adicionar à Tela de Início.');
      return;
    }

    setMessage('O navegador ainda não liberou a instalação nativa. No Android, use o Google Chrome e verifique se “Instalar app” aparece no menu do navegador.');
  };

  if (!visible || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/25 bg-[#0b0b0f] shadow-2xl shadow-black/60">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-zinc-400 hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pt-8 text-center">
          <img
            src={`${import.meta.env.BASE_URL}icon-512.webp`}
            alt="Studio Black7"
            className="mx-auto h-28 w-28 rounded-3xl object-cover shadow-xl shadow-amber-500/10"
          />

          <h2 className="mt-5 font-['Cinzel'] text-2xl font-black text-white">Instale o Studio Black7</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Tenha o Studio Black7 direto na tela inicial do celular, como um aplicativo.
          </p>

          <button
            type="button"
            onClick={() => void install()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-4 text-sm font-black uppercase tracking-wider text-zinc-950 shadow-lg shadow-amber-500/20"
          >
            <Download className="h-5 w-5" />
            Instalar agora
          </button>

          {message && (
            <p className="mt-3 rounded-xl border border-amber-400/15 bg-amber-400/5 px-3 py-2 text-xs leading-relaxed text-amber-100">
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="mt-3 text-xs font-semibold text-zinc-500 hover:text-zinc-300"
          >
            Continuar no site
          </button>
        </div>
      </div>
    </div>
  );
};
