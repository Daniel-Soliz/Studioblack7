import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, ShoppingBag, Shield, Download } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { STUDIO_BLACK_LOGO } from '../assets/images';
import { getAssetUrl } from '../utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => (window.__sb7InstallPrompt as BeforeInstallPromptEvent | undefined) ?? null
  );
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [installMessage, setInstallMessage] = useState('');
  const { totalItems } = useCart();
  const { settings } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const whatsappRaw = (settings.whatsappRaw || settings.whatsapp || '').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappRaw}?text=${encodeURIComponent(
    'Olá! Vim pelo site do Studio Black7 e gostaria de consultar os horários disponíveis.'
  )}`;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsAppInstalled(standalone);

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      const installEvent = event as BeforeInstallPromptEvent;
      window.__sb7InstallPrompt = installEvent;
      setDeferredInstallPrompt(installEvent);
      setInstallMessage('');
    };

    const syncEarlyInstallPrompt = () => {
      const installEvent = window.__sb7InstallPrompt as BeforeInstallPromptEvent | undefined;
      if (installEvent) {
        setDeferredInstallPrompt(installEvent);
        setInstallMessage('');
      }
    };

    const handleInstalled = () => {
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
      window.__sb7InstallPrompt = undefined;
      setInstallMessage('Studio Black7 instalado com sucesso.');
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('sb7-install-ready', syncEarlyInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('sb7-app-installed', handleInstalled);

    // Synchronize immediately in case the event fired before Header mounted.
    syncEarlyInstallPrompt();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('sb7-install-ready', syncEarlyInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('sb7-app-installed', handleInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    setInstallMessage('');

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (standalone) {
      setIsAppInstalled(true);
      setInstallMessage('O Studio Black7 já está instalado neste aparelho.');
      return;
    }

    if ('serviceWorker' in navigator) {
      try {
        await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((resolve) => window.setTimeout(resolve, 1500)),
        ]);
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      } catch {
        // A instalação manual continua disponível mesmo se o service worker demorar.
      }
    }

    const installPrompt =
      deferredInstallPrompt ||
      (window.__sb7InstallPrompt as BeforeInstallPromptEvent | undefined) ||
      null;

    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;

        if (choice.outcome === 'accepted') {
          setInstallMessage('Instalação iniciada. O Studio Black7 será adicionado à tela do seu aparelho.');
          setMobileMenuOpen(false);
        } else {
          setInstallMessage('Instalação cancelada. Você pode tentar novamente quando quiser.');
        }

        setDeferredInstallPrompt(null);
        window.__sb7InstallPrompt = undefined;
      } catch {
        setInstallMessage('Não foi possível abrir a janela automática. Use a instalação pelo menu do navegador.');
      }
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (isIOS) {
      setInstallMessage('No iPhone: toque em Compartilhar e depois em “Adicionar à Tela de Início”.');
      return;
    }

    if (isAndroid) {
      setInstallMessage('No Chrome: toque nos três pontos (⋮) no canto superior direito → “Instalar app” ou “Adicionar à tela inicial” → confirme em “Instalar”.');
      return;
    }

    setInstallMessage('No Chrome ou Edge, abra o menu do navegador e escolha “Instalar Studio Black7” ou “Instalar este site como aplicativo”.');
  };

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Sobre', path: '/sobre' },
    { label: 'Serviços', path: '/servicos' },
    { label: 'Loja', path: '/loja' },
    { label: 'Localização', path: '/localizacao' },
    { label: 'Contato', path: '/contato' },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    setMobileMenuOpen(false);
    navigate(link.path);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#08080a]/95 backdrop-blur-md border-b border-amber-500/15 shadow-xl shadow-black/40 py-2 sm:py-2.5'
          : 'bg-gradient-to-b from-black/95 via-black/60 to-transparent py-2.5 sm:py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo with round mascot/emblem */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-16 h-16 sm:w-[76px] sm:h-[76px] shrink-0 flex items-center justify-center">
            <img
              src={settings.logoUrl && settings.logoUrl !== '/images/ray_logo.png' ? getAssetUrl(settings.logoUrl) : STUDIO_BLACK_LOGO}
              alt="Studio Black7"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
              onError={(e) => {
                // Fallback to stylized insignia
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-['Cinzel'] font-black text-amber-400 text-2xl hidden fallback-mark">7</span>
          </div>

          <div className="flex flex-col">
            <span className="font-['Cinzel'] font-black text-base sm:text-lg tracking-widest text-white group-hover:text-amber-300 transition-colors">
              {settings.companyName || 'STUDIO BLACK7'}
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-amber-400/90 font-semibold">
              Barbearia Premium · ZN SP
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = link.path === '/loja' ? location.pathname.startsWith('/loja') || location.pathname.startsWith('/produto') : location.pathname === link.path;

            return (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link)}
                className={`text-xs font-bold uppercase tracking-wider transition-colors py-1 relative cursor-pointer ${
                  isActive ? 'text-amber-400' : 'text-zinc-300 hover:text-amber-300'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Cart, WhatsApp & Admin */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isAppInstalled && (
            <button
              type="button"
              onClick={() => void handleInstallApp()}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-amber-400/30 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all"
              title="Instalar Studio Black7"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}

          {/* Cart Icon with Counter */}
          <Link
            to="/carrinho"
            className="relative p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-400/50 text-zinc-200 hover:text-amber-400 transition-all shadow-md flex items-center justify-center"
            title="Carrinho de Compras"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 font-black text-[10px] flex items-center justify-center shadow-lg animate-pulse">
                {totalItems}
              </span>
            )}
          </Link>

          {/* WhatsApp Booking CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-105 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-zinc-950" />
            <span>WhatsApp</span>
          </a>

          {/* Subtle Admin Access link */}
          <Link
            to="/admin/login"
            className="p-2 rounded-full text-zinc-500 hover:text-amber-400 hover:bg-zinc-900 transition-colors"
            title="Área Administrativa"
          >
            <Shield className="w-4 h-4" />
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 focus:outline-none"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0e] border-b border-zinc-800 px-4 pt-4 pb-6 mt-3 space-y-4 shadow-2xl animate-fadeIn">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider text-zinc-300 hover:text-amber-400 hover:bg-zinc-900 transition-all cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2.5">
            {!isAppInstalled && (
              <button
                type="button"
                onClick={() => void handleInstallApp()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Instalar App</span>
              </button>
            )}
            {installMessage && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-3 text-[11px] leading-relaxed text-amber-100">
                <strong className="mb-1 block text-amber-300">Instalação do Studio Black7</strong>
                {installMessage}
              </div>
            )}

            <Link
              to="/carrinho"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-200"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Ver Meu Carrinho</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-xs">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
            >
              <MessageCircle className="w-4 h-4 fill-zinc-950" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
