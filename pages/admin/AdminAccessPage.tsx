import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  LogIn,
  AlertTriangle,
  MonitorSmartphone,
  MapPin,
  Clock3,
  KeyRound,
  Eye,
  LogOut,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import {
  AdminAccessLogRecord,
  AdminSecurityService,
} from '../../services/adminSecurityService';

const eventLabel: Record<string, { label: string; icon: React.ElementType }> = {
  login_success: { label: 'Login autorizado', icon: LogIn },
  login_failed: { label: 'Tentativa recusada', icon: AlertTriangle },
  admin_page_view: { label: 'Acesso ao painel', icon: Eye },
  logout: { label: 'Sessão encerrada', icon: LogOut },
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });

export const AdminAccessPage: React.FC = () => {
  const { session } = useAuth();
  const [days, setDays] = useState(30);
  const [logs, setLogs] = useState<AdminAccessLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    if (!session?.token) return;

    setLoading(true);
    setError('');

    try {
      const result = await AdminSecurityService.list(session.token, days);
      setLogs(Array.isArray(result.logs) ? result.logs : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o histórico de acessos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, [days, session?.token]);

  const stats = useMemo(() => {
    const successfulLogins = logs.filter(
      (item) => item.event_type === 'login_success'
    );
    const failedLogins = logs.filter(
      (item) => item.event_type === 'login_failed'
    );
    const uniqueIps = new Set(
      successfulLogins
        .map((item) => item.ip_address)
        .filter((value): value is string => Boolean(value))
    );

    return {
      successful: successfulLogins.length,
      failed: failedLogins.length,
      uniqueIps: uniqueIps.size,
      lastSuccess: successfulLogins[0]?.created_at || null,
    };
  }, [logs]);

  return (
    <AdminLayout title="Acessos do Administrador">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[11px] uppercase tracking-widest font-black">
                Auditoria de Segurança
              </span>
            </div>
            <h1 className="font-['Cinzel'] text-2xl font-black text-white">
              Histórico de Acessos ao ADM
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
              Consulte entradas autorizadas, tentativas recusadas, dispositivo,
              navegador, IP e localização aproximada quando disponível.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[7, 30, 90].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDays(value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  days === value
                    ? 'bg-amber-400 text-zinc-950 border-amber-400'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-amber-400/50'
                }`}
              >
                {value} dias
              </button>
            ))}
            <button
              type="button"
              onClick={() => void loadLogs()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-800 border border-zinc-700 text-white hover:border-amber-400/50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Logins autorizados
              </span>
              <LogIn className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 font-mono text-3xl font-black text-white">
              {stats.successful}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Nos últimos {days} dias</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Tentativas recusadas
              </span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="mt-3 font-mono text-3xl font-black text-white">
              {stats.failed}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Credenciais inválidas</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                IPs autorizados
              </span>
              <MonitorSmartphone className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 font-mono text-3xl font-black text-white">
              {stats.uniqueIps}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">IPs distintos com login válido</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Último login
              </span>
              <Clock3 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 text-sm font-bold text-white min-h-9 flex items-center">
              {stats.lastSuccess ? formatDateTime(stats.lastSuccess) : 'Nenhum registro'}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Última entrada autorizada</p>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden">
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-['Cinzel'] text-sm font-bold text-white">
                Registros de Segurança
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Os registros ficam armazenados no Supabase e não dependem deste navegador.
              </p>
            </div>
            <KeyRound className="w-5 h-5 text-amber-400 shrink-0" />
          </div>

          {loading ? (
            <div className="py-14 text-center text-xs text-zinc-500">
              Carregando histórico de acessos...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-14 text-center text-xs text-zinc-500">
              Nenhum acesso registrado nesse período.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-black/30 text-[10px] uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Data / hora</th>
                    <th className="px-4 py-3">Evento</th>
                    <th className="px-4 py-3">Usuário</th>
                    <th className="px-4 py-3">Dispositivo</th>
                    <th className="px-4 py-3">IP</th>
                    <th className="px-4 py-3">Local aprox.</th>
                    <th className="px-4 py-3">Página</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {logs.map((item) => {
                    const info = eventLabel[item.event_type] || {
                      label: item.event_type,
                      icon: ShieldCheck,
                    };
                    const Icon = info.icon;

                    return (
                      <tr key={item.id} className="text-xs text-zinc-300">
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px]">
                          {formatDateTime(item.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 font-bold ${
                              item.success ? 'text-emerald-300' : 'text-red-300'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {info.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-52 truncate">
                          {item.identifier || item.user_email || 'Não informado'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">
                            {item.device_type || 'Não identificado'}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {[item.browser, item.os].filter(Boolean).join(' · ') || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          {item.ip_address || 'Não disponível'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            {[item.city, item.country].filter(Boolean).join(', ') ||
                              'Não disponível'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">
                          {item.path || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/20 text-[11px] text-zinc-400">
          <strong className="text-amber-300">Privacidade:</strong> a localização é apenas aproximada
          e depende das informações técnicas disponibilizadas pela conexão. O painel não acessa GPS
          nem localização exata do aparelho.
        </div>
      </div>
    </AdminLayout>
  );
};
