import React, { useEffect, useRef, useState } from 'react';
import { Download, Share, Smartphone, X, PlusSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function InstallApp() {
  const { pathname } = useLocation();
  const deferred = useRef<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const ios = isIOS();
  useEffect(() => {
    const prompt = (event: Event) => { event.preventDefault(); deferred.current = event as InstallPrompt; setReady(true); };
    const done = () => { deferred.current = null; setInstalled(true); setOpen(false); };
    const show = () => { if (!isStandalone()) setOpen(true); };
    window.addEventListener('beforeinstallprompt', prompt);
    window.addEventListener('appinstalled', done);
    window.addEventListener('sb7-install-app', show);
    let timer: number | undefined;
    try {
      if (!isStandalone() && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && !sessionStorage.getItem('sb7-install-seen') && ['/', '/servicos','/loja','/sobre'].includes(pathname)) {
        timer = window.setTimeout(() => { setOpen(true); sessionStorage.setItem('sb7-install-seen', '1'); }, 1800);
      }
    } catch { /* The install button remains available when storage is disabled. */ }
    return () => { window.clearTimeout(timer); window.removeEventListener('beforeinstallprompt', prompt); window.removeEventListener('appinstalled', done); window.removeEventListener('sb7-install-app', show); };
  }, []);
  const install = async () => {
    const event = deferred.current;
    if (!event || busy) return;
    setBusy(true); setNotice('');
    try {
      await event.prompt();
      const choice = await event.userChoice;
      deferred.current = null; setReady(false);
      if (choice.outcome === 'accepted') setOpen(false);
    } catch { setNotice('Abra o menu do navegador e escolha Instalar aplicativo ou Adicionar à tela inicial.'); }
    finally { setBusy(false); }
  };
  if (installed || pathname.startsWith('/admin')) return null;
  return <>
    <button onClick={() => setOpen(true)} className="fixed bottom-5 left-4 z-40 flex items-center gap-2 rounded-full border border-amber-400/40 bg-zinc-950 px-3 py-2.5 text-xs font-bold text-amber-300 shadow-xl" aria-label="Instalar aplicativo Studio Black7"><Download className="h-4 w-4" />Instalar app</button>
    {open && <div className="fixed inset-0 z-[100] bg-black/75 p-4 flex items-end sm:items-center justify-center" onClick={() => setOpen(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="install-title" className="relative max-h-[85dvh] overflow-y-auto w-full max-w-md rounded-3xl border border-amber-400/30 bg-zinc-950 p-6 pb-7 text-white shadow-2xl" onClick={event => event.stopPropagation()} onKeyDown={event => {
        if (event.key === 'Escape') setOpen(false);
        if (event.key === 'Tab') {
          const buttons = (event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
          const first = buttons[0], last = buttons[buttons.length-1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
        <button autoFocus onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-full p-2 text-zinc-400" aria-label="Fechar instalação"><X className="h-5 w-5" /></button>
        <img src={import.meta.env.BASE_URL + 'icon-192.png?v=20261009'} alt="Studio Black7" className="mb-4 h-16 w-16 rounded-2xl" />
        <h2 id="install-title" className="text-2xl font-bold">Black7 no seu celular</h2>
        <p className="mt-2 text-sm text-zinc-300">Agende seu corte, acompanhe seu Pix e compre produtos com um toque na tela inicial.</p>
        {ios ? <ol className="my-5 space-y-4 text-sm">
          <li className="flex gap-3"><Share className="h-5 w-5 shrink-0 text-amber-400" /><span>1. Abra este site no <strong>Safari</strong> e toque em <strong>Compartilhar</strong> (ou no menu e depois Compartilhar).</span></li>
          <li className="flex gap-3"><PlusSquare className="h-5 w-5 shrink-0 text-amber-400" /><span>2. Escolha <strong>Adicionar à Tela de Início</strong>.</span></li>
          <li className="flex gap-3"><Smartphone className="h-5 w-5 shrink-0 text-amber-400" /><span>3. Aguarde o nome e o ícone carregarem. Se aparecer, ative <strong>Abrir como App da Web</strong> e toque em <strong>Adicionar</strong>.</span></li>
        </ol> : ready ? <button disabled={busy} onClick={() => void install()} className="mt-5 w-full rounded-xl bg-amber-400 p-3 font-bold text-black disabled:opacity-60">{busy ? 'Abrindo instalação…' : 'Instalar Studio Black7'}</button> : <p className="my-5 rounded-xl bg-zinc-900 p-4 text-sm text-zinc-200">Abra o menu <strong>⋮</strong> do Chrome e toque em <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>. Se estiver no Instagram ou WhatsApp, escolha primeiro <strong>Abrir no navegador</strong>.</p>}
        {notice && <p role="status" className="mt-3 text-sm text-amber-300">{notice}</p>}
        <p className="mt-4 text-xs text-zinc-400">Grátis. Sem cadastro para instalar. Agendamentos e pagamentos precisam de internet.</p>
        <button onClick={() => setOpen(false)} className="mt-4 w-full rounded-xl border border-zinc-700 py-3 text-sm">Continuar no site</button>
      </section>
    </div>}
  </>;
}
