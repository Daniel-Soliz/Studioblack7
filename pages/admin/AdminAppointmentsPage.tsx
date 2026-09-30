import React, { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

type Appointment = { id: string; service_name: string; professional_name: string; customer_name: string; customer_email: string; customer_phone: string; start_at: string; end_at: string; amount_cents: number; status: string; payment_status: string; payment_reference: string };
type Window = { start: string; end: string };
type Closure = { date: string; professionalId: string; start?: string; end?: string };
type Settings = { weekly: Record<string, Window[]>; closures: Closure[] };
const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const api = 'https://oyghjlwujdmgfkopujip.supabase.co/functions/v1/appointments';
export const AdminAppointmentsPage: React.FC = () => {
  const { session } = useAuth();
  const [tab, setTab] = useState<'reservas' | 'horarios' | 'folgas'>('reservas');
  const [rows, setRows] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [notice, setNotice] = useState('');
  const [blockDate, setBlockDate] = useState('');
  const [blockProfessional, setBlockProfessional] = useState('all');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const call = useCallback(async (action: string, extra = {}) => {
    const response = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, token: session?.token, ...extra }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha ao carregar agendamentos.');
    return data;
  }, [session?.token]);
  const refresh = useCallback(async () => {
    if (!session?.token) return;
    setLoading(true);
    try {
      const [agenda, configuration] = await Promise.all([call('admin_list'), call('admin_settings')]);
      setRows(agenda.appointments || []); setSettings(configuration.settings); setError('');
    }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar.'); }
    finally { setLoading(false); }
  }, [call, session?.token]);
  useEffect(() => { void refresh(); }, [refresh]);
  const change = async (id: string, status: string) => {
    if (!window.confirm(status === 'cancelled' ? 'Cancelar este agendamento? Um pagamento já realizado não será estornado automaticamente.' : 'Marcar atendimento como concluído?')) return;
    try { await call('admin_update', { id, status }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao atualizar.'); }
  };
  const editWindow = (day: number, index: number, field: keyof Window, value: string) => setSettings(prev => {
    if (!prev) return prev;
    const weekly = { ...prev.weekly, [day]: [...prev.weekly[day]] };
    weekly[day][index] = { ...weekly[day][index], [field]: value };
    return { ...prev, weekly };
  });
  const setDay = (day: number, windows: Window[]) => setSettings(prev => prev ? { ...prev, weekly: { ...prev.weekly, [day]: windows } } : prev);
  const saveSettings = async () => {
    if (!settings) return;
    setLoading(true); setError(''); setNotice('');
    try {
      const response = await call('admin_save_settings', { settings });
      setSettings(response.settings); setNotice('Disponibilidade salva. Novos agendamentos já seguem estes horários.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao salvar horários.'); }
    finally { setLoading(false); }
  };
  const addBlock = () => {
    if (!settings || !blockDate || Boolean(blockStart) !== Boolean(blockEnd)) { setError('Escolha uma data e preencha os dois horários para bloqueio parcial.'); return; }
    setSettings({ ...settings, closures: [...settings.closures, { date: blockDate, professionalId: blockProfessional, ...(blockStart && blockEnd ? { start: blockStart, end: blockEnd } : {}) }] });
    setBlockDate(''); setBlockStart(''); setBlockEnd(''); setError('');
  };
  return <AdminLayout title="Agendamentos"><div className="space-y-5 text-zinc-100">
    <div className="flex justify-between items-center gap-4"><div><h1 className="text-2xl font-bold">Agenda</h1><p className="text-sm text-zinc-400">Reservas e pagamentos Pix dos serviços.</p></div><button onClick={refresh} disabled={loading} className="px-4 py-2 bg-amber-400 text-black rounded-lg font-bold">Atualizar</button></div>
    {error && <p role="alert" className="text-red-400">{error}</p>}
    {notice && <p role="status" className="text-emerald-400">{notice}</p>}
    <nav className="grid grid-cols-3 gap-2" aria-label="Organizar agenda">{([['reservas', 'Clientes'], ['horarios', 'Dias e horas'], ['folgas', 'Folgas']] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setTab(value)} aria-pressed={tab === value} className={`rounded-xl p-3 sm:p-4 text-sm sm:text-base font-bold ${tab === value ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-white'}`}>{label}</button>)}</nav>
    {settings && tab !== 'reservas' && <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-5">
      <div><h2 className="text-xl font-bold text-amber-400">{tab === 'horarios' ? 'Quando você vai atender?' : 'Precisa de uma folga?'}</h2><p className="text-sm text-zinc-300">{tab === 'horarios' ? 'Abra os dias de atendimento e escolha a hora de começar e terminar.' : 'Escolha o dia em que não vai atender. Você também pode bloquear só algumas horas.'}</p></div>
      {tab === 'horarios' && <><button type="button" onClick={() => { if (!settings.weekly['1']?.length) { setError('Primeiro defina os horários de segunda-feira.'); return; } setSettings({ ...settings, weekly: { ...settings.weekly, ...Object.fromEntries([2,3,4,5,6].map(day => [String(day), settings.weekly['1'].map(w => ({...w}))])) } }); }} className="rounded-xl border border-zinc-600 px-4 py-3 text-sm font-bold">Usar horários de segunda de terça a sábado</button><div className="grid gap-3">{dayNames.map((name, day) => <div key={name} className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="lg:w-40 flex items-center justify-between gap-3 font-semibold"><span>{name}</span><button type="button" aria-pressed={Boolean(settings.weekly[day]?.length)} onClick={() => setDay(day, settings.weekly[day]?.length ? [] : [{start: '09:00', end: '12:00'}, {start: '13:30', end: '21:00'}])} className={`rounded-lg px-3 py-2 text-sm ${settings.weekly[day]?.length ? 'bg-emerald-800 text-white' : 'bg-zinc-700 text-zinc-300'}`}>{settings.weekly[day]?.length ? 'Aberto' : 'Fechado'}</button></div>
        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-3">{settings.weekly[day]?.map((window, index) => <div key={index} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 w-full sm:w-auto min-w-0">
          <input aria-label={`${name}, início ${index + 1}`} type="time" value={window.start} onChange={e => editWindow(day, index, 'start', e.target.value)} className="w-full min-w-0 sm:w-[110px] rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm" />
          <span className="text-zinc-400">até</span>
          <input aria-label={`${name}, fim ${index + 1}`} type="time" value={window.end} onChange={e => editWindow(day, index, 'end', e.target.value)} className="w-full min-w-0 sm:w-[110px] rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm" />
          <button type="button" aria-label={`Remover intervalo ${index + 1} de ${name}`} onClick={() => setDay(day, settings.weekly[day].filter((_, i) => i !== index))} className="col-span-3 sm:col-span-1 text-red-400 py-2 text-sm">Remover intervalo</button>
        </div>)}{!settings.weekly[day]?.length && <span className="text-zinc-500 text-sm">Fechado</span>}</div>
        <button type="button" disabled={(settings.weekly[day]?.length || 0) >= 3} onClick={() => setDay(day, [...(settings.weekly[day] || []), { start: '12:30', end: '13:00' }])} className="text-amber-400 border border-amber-500/40 rounded-lg px-3 py-2 text-sm disabled:opacity-40">+ Outro horário</button>
      </div>)}</div></>}
      {tab === 'folgas' && <div className="border-t border-zinc-800 pt-5 space-y-3"><h3 className="font-bold">Marcar uma folga</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0"><label className="grid min-w-0 gap-2 text-base font-semibold">Data<input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 p-3" /></label>
        <label className="grid min-w-0 gap-2 text-base font-semibold">Profissional<select value={blockProfessional} onChange={e => setBlockProfessional(e.target.value)} className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 p-3"><option value="all">Todos</option><option value="ray-black7">Ray Black7</option><option value="barbeiro-executor">Barbeiro Executor</option></select></label>
        <label className="grid min-w-0 gap-2 text-base font-semibold">Das (opcional)<input type="time" value={blockStart} onChange={e => setBlockStart(e.target.value)} className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 p-3" /></label>
        <label className="grid min-w-0 gap-2 text-base font-semibold">Até (opcional)<input type="time" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 p-3" /></label>
        <button type="button" onClick={addBlock} className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-bold">Adicionar folga</button></div>
        <p className="text-xs text-zinc-500">Deixe “Das” e “Até” vazios para bloquear o dia inteiro.</p>
        <div className="flex flex-wrap gap-2">{settings.closures.map((block, index) => <span key={`${block.date}-${index}`} className="rounded-lg bg-zinc-800 px-3 py-2 text-xs">{block.date} · {block.professionalId === 'all' ? 'Todos' : block.professionalId === 'ray-black7' ? 'Ray' : 'Executor'} · {block.start ? `${block.start}–${block.end}` : 'dia inteiro'} <button type="button" aria-label={`Remover bloqueio de ${block.date}`} onClick={() => setSettings({ ...settings, closures: settings.closures.filter((_, i) => i !== index) })} className="ml-2 text-red-400">Remover</button></span>)}</div>
      </div>}
      <p className="text-sm text-zinc-400">As mudanças valem para novas reservas. Atendimentos já confirmados continuam agendados.</p>
      <button type="button" disabled={loading} onClick={saveSettings} className="rounded-xl bg-amber-400 px-6 py-3 font-black text-black disabled:opacity-50">Salvar {tab === 'horarios' ? 'meus horários' : 'minhas folgas'}</button>
    </section>}
    {tab === 'reservas' && <><h2 className="text-xl font-bold">Seus clientes agendados</h2>
    <div className="grid gap-3">{rows.map(row => <article key={row.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
      <div className="flex flex-wrap justify-between gap-2"><strong>{new Date(row.start_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })} · {row.service_name}</strong><span className={row.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>{({pending_payment: 'Aguardando Pix', confirmed: 'Confirmado', completed: 'Atendido', cancelled: 'Cancelado', expired: 'Reserva vencida'} as Record<string,string>)[row.status] || row.status}</span></div>
      <p className="text-sm text-zinc-300">{row.professional_name} · R$ {(row.amount_cents / 100).toFixed(2).replace('.', ',')}</p>
      <p className="break-words text-sm text-zinc-300">{row.customer_name} · {row.customer_phone} · {row.customer_email}</p>
      <p className="break-all text-xs text-zinc-500">Código: {row.payment_reference}</p>
      {row.status === 'confirmed' && <div className="flex gap-2"><button onClick={() => change(row.id, 'completed')} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm">Concluir</button><button onClick={() => change(row.id, 'cancelled')} className="rounded-lg bg-zinc-700 px-3 py-2 text-sm">Cancelar</button></div>}
    </article>)}{!loading && !rows.length && <p className="text-zinc-400">Ainda não há clientes agendados.</p>}</div></>}
  </div></AdminLayout>;
};
