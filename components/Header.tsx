import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, ShoppingBag, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { createWhatsAppBookingUrl } from '../data/barbershop';
import { STUDIO_BLACK_LOGO } from '../assets/images';
import { getAssetUrl } from '../utils';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { settings } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              alt="Studio Black - Raspe Barba & Cia"
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

        {/* Right Actions: Cart, Agendar & Admin */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            href={createWhatsAppBookingUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-105 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Agendar</span>
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
              href={createWhatsAppBookingUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
            >
              <MessageCircle className="w-4 h-4 fill-zinc-950" />
              <span>Agendar no WhatsApp (+55 11 98726-7087)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
