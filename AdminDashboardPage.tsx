import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scissors, 
  Package, 
  Images, 
  Palette, 
  FileText, 
  Phone, 
  MapPin, 
  Clock, 
  Settings, 
  ExternalLink,
  History,
  TrendingUp,
  Boxes,
  ShoppingCart,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';

export const AdminDashboardPage: React.FC = () => {
  const { 
    services, 
    products, 
    gallery, 
    activities, 
    orders, 
    settings 
  } = useStore();

  // Quantidade de fotos total (fotos de galeria + fotos de produtos cadastradas + fotos institucionais)
  const productPhotosCount = products.reduce((acc, p) => acc + (p.images?.length || (p.image ? 1 : 0)), 0);
  const totalPhotosCount = gallery.length + productPhotosCount;

  // Últimas alterações
  const recentActivities = activities.slice(0, 7);

  // Stats
  const activeServicesCount = services.filter(s => s.status !== 'inactive').length;
  const activeProductsCount = products.filter(p => p.status !== 'inactive').length;
  const pendingOrders = orders.filter(o => o.status === 'pending');

  const shortcuts = [
    {
      title: 'Tabela de Serviços',
      description: 'Alterar nomes, preços, categorias e status',
      path: '/admin/servicos',
      icon: Scissors,
      color: 'from-amber-500/20 to-amber-500/5',
      borderColor: 'border-amber-500/30',
      badge: `${services.length} itens`
    },
    {
      title: 'Produtos da Barbearia',
      description: 'Gerenciar pomadas, óleos, preços e estoque',
      path: '/admin/produtos',
      icon: Package,
      color: 'from-amber-400/20 to-amber-400/5',
      borderColor: 'border-amber-400/30',
      badge: `${products.length} itens`
    },
    {
      title: 'Galeria de Trabalhos',
      description: 'Fotos de cortes, barbas e pigmentação',
      path: '/admin/galeria',
      icon: Images,
      color: 'from-amber-600/20 to-amber-600/5',
      borderColor: 'border-amber-600/30',
      badge: `${gallery.length} fotos`
    },
    {
      title: 'Imagens do Site',
      description: 'Foto principal do Ray, logo, banner e favicon',
      path: '/admin/imagens',
      icon: Palette,
      color: 'from-zinc-800/60 to-zinc-900/60',
      borderColor: 'border-zinc-700',
      badge: 'Visual'
    },
    {
      title: 'Conteúdo & Textos',
      description: 'Slogans, textos da home e dados do fundador',
      path: '/admin/conteudo',
      icon: FileText,
      color: 'from-zinc-800/60 to-zinc-900/60',
      borderColor: 'border-zinc-700',
      badge: 'Textos'
    },
    {
      title: 'Informações de Contato',
      description: 'WhatsApp oficial, redes sociais e e-mails',
      path: '/admin/contato',
      icon: Phone,
      color: 'from-zinc-800/60 to-zinc-900/60',
      borderColor: 'border-zinc-700',
      badge: settings.whatsappRaw || 'Ativo'
    },
    {
      title: 'Localização & Mapa',
      description: 'Endereço, ponto de referência e link Maps',
      path: '/admin/localizacao',
      icon: MapPin,
      color: 'from-zinc-800/60 to-zinc-900/60',
      borderColor: 'border-zinc-700',
      badge: 'Zona Norte'
    },
    {
      title: 'Horários de Atendimento',
      description: 'Semana, sábados e avisos de funcionamento',
      path: '/admin/horarios',
      icon: Clock,
      color: 'from-zinc-800/60 to-zinc-900/60',
      borderColor: 'border-zinc-700',
      badge: 'Seg–Sáb'
    },
    {
      title: 'Configurações do Sistema',
      description: 'Troca de senha, backup JSON e parâmetros',
      path: '/admin/configuracoes',
      icon: Settings,
      color: 'from-zinc-800/60 to-zinc-900/60',
      borderColor: 'border-zinc-700',
      badge: 'Segurança'
    }
  ];

  return (
    <AdminLayout title="Painel de Controle">
      <div className="space-y-8">
        
        {/* Top Header / Welcome */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#14141c] via-[#0f0f15] to-[#0a0a0f] border border-amber-400/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              SISTEMA OPERACIONAL · STUDIO BLACK7
            </span>
            <h1 className="font-['Cinzel'] text-2xl sm:text-3xl font-black text-white">
              Painel de Gestão e Customização
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Todas as alterações feitas neste painel são salvas e refletidas instantaneamente nas páginas públicas do site.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver Site ao Vivo</span>
            </Link>
          </div>
        </div>

        {/* 3 Core Metric Cards (Requested by user) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Visão Geral do Catálogo &amp; Mídias
            </h2>
            <span className="text-[11px] text-zinc-500">Métricas em tempo real</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Quantidade de Serviços */}
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/40 transition-all shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Serviços</span>
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Scissors className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-black text-white">{services.length}</span>
                <span className="text-xs text-amber-400 font-semibold">{activeServicesCount} ativos</span>
              </div>
              <p className="text-[11px] text-zinc-500">Cortes, barbas, pigmentação e químicas</p>
            </div>

            {/* 2. Quantidade de Produtos */}
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/40 transition-all shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Produtos</span>
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-black text-white">{products.length}</span>
                <span className="text-xs text-amber-400 font-semibold">{activeProductsCount} à venda</span>
              </div>
              <p className="text-[11px] text-zinc-500">Pomadas, sprays, óleos e acessórios</p>
            </div>

            {/* 3. Quantidade de Fotos */}
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/40 transition-all shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Fotos Cadastradas</span>
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Images className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-black text-white">{totalPhotosCount}</span>
                <span className="text-xs text-amber-400 font-semibold">{gallery.length} na galeria</span>
              </div>
              <p className="text-[11px] text-zinc-500">Galeria de trabalhos + catálogo de produtos</p>
            </div>

            {/* 4. Pedidos da Loja */}
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/40 transition-all shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pedidos Online</span>
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-black text-white">{orders.length}</span>
                <span className="text-xs text-amber-400 font-semibold">{pendingOrders.length} novos</span>
              </div>
              <p className="text-[11px] text-zinc-500">Fluxo de pedidos direto via WhatsApp</p>
            </div>

          </div>
        </div>

        {/* Shortcuts for editing the site (Atalhos para editar o site) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Atalhos de Customização do Site
            </h2>
            <span className="text-[11px] text-zinc-500">Acesse qualquer seção em 1 clique</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortcuts.map((sc) => {
              const Icon = sc.icon;
              return (
                <Link
                  key={sc.path}
                  to={sc.path}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${sc.color} border ${sc.borderColor} hover:border-amber-400 transition-all duration-200 group flex flex-col justify-between space-y-4 shadow-lg`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-black/60 border border-zinc-700 group-hover:border-amber-400/60 flex items-center justify-center text-amber-400 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/80 border border-zinc-700 text-zinc-300">
                      {sc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-['Cinzel'] font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                      {sc.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {sc.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Acessar e Editar</span>
                    <span>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Últimas Alterações (Activity Logs) */}
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-amber-400" />
              <h2 className="font-['Cinzel'] font-bold text-sm text-white">
                Últimas Alterações Registradas
              </h2>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              Histórico seguro de atualizações
            </span>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              Nenhuma alteração registrada recentemente.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {recentActivities.map((act) => (
                <div key={act.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">
                        {act.action}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {act.detail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:shrink-0 text-[10px] text-zinc-500 font-mono">
                    {act.dateFormatted || new Date(act.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};
