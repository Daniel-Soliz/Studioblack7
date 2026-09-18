import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scissors,
  Package, 
  Palette,
  FileText,
  Phone,
  MapPin,
  Clock,
  Boxes, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { getAssetUrl } from '../../utils';
import { AdminSecurityService } from '../../services/adminSecurityService';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { session, isLoading, logout } = useAuth();
  const { products, orders, settings } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const lastLoggedPath = useRef<string>('');

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const lowStockCount = products.filter(p => (p.stock ?? 0) <= (settings.lowStockThreshold || 3)).length;

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Serviços', path: '/admin/servicos', icon: Scissors },
    { label: 'Produtos', path: '/admin/produtos', icon: Package },
    { label: 'Imagens do Site', path: '/admin/imagens', icon: Palette },
    { label: 'Conteúdo', path: '/admin/conteudo', icon: FileText },
    { label: 'Contato', path: '/admin/contato', icon: Phone },
    { label: 'Localização', path: '/admin/localizacao', icon: MapPin },
    { label: 'Horários', path: '/admin/horarios', icon: Clock },
    { label: 'Pedidos', path: '/admin/pedidos', icon: ShoppingCart, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-red-500' },
    { label: 'Estoque', path: '/admin/estoque', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500' },
    { label: 'Acessos', path: '/admin/acessos', icon: ShieldCheck },
    { label: 'Configurações', path: '/admin/configuracoes', icon: Settings },
  ];

  useEffect(() => {
    if (!session?.token || !location.pathname.startsWith('/admin/')) return;
    if (lastLoggedPath.current === location.pathname) return;

    lastLoggedPath.current = location.pathname;
    void AdminSecurityService.log(
      session.token,
      'admin_page_view',
      location.pathname
    ).catch(() => {
      // O painel continua funcional mesmo se o registro de auditoria falhar.
    });
  }, [location.pathname, session?.token]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090d] text-zinc-400 flex items-center justify-center text-sm">
        Validando sessão administrativa...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen bg-[#09090d] text-zinc-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#0c0c12] border-r border-zinc-850 p-5 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-6">
          {/* Admin Header / Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/80">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/60 bg-black flex items-center justify-center shrink-0">
              <img
                src={getAssetUrl(settings.logoUrl || '/images/ray_logo.png')}
                alt="Studio Black7"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="overflow-hidden">
              <span className="font-['Cinzel'] font-bold text-sm text-white block truncate">
                STUDIO BLACK7
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Painel Admin</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/20'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${item.badgeColor || 'bg-zinc-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Loja / Site</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden bg-[#0c0c12] border-b border-zinc-850 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/60 bg-black flex items-center justify-center">
            <img src={getAssetUrl(settings.logoUrl || '/images/ray_logo.png')} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-['Cinzel'] font-bold text-xs text-white">
            ADMIN · STUDIO BLACK7
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-[#0c0c12] border-b border-zinc-800 p-4 space-y-2 fixed top-16 left-0 right-0 z-40 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-300 hover:bg-zinc-850'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-zinc-950">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-zinc-800 flex justify-between">
            <Link to="/" target="_blank" className="text-xs text-amber-400 flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Site</span>
            </Link>
            <button onClick={handleLogout} className="text-xs text-red-400 flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar header */}
        <header className="h-16 border-b border-zinc-850 bg-[#0c0c12]/80 backdrop-blur-md px-6 flex items-center justify-between">
          <h1 className="font-['Cinzel'] font-bold text-lg text-white truncate">
            {title}
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-white block">
                {session?.name || 'Ray Silva'}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {session?.email || 'admin@black7.com'}
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 font-black text-xs flex items-center justify-center">
              R7
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 md:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
