import React, { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

type Appointment = { id: string; service_name: string; professional_name: string; customer_name: string; customer_email: string; customer_phone: string; start_at: string; end_at: string; amount_cents: number; status: string; payment_status: string; payment_reference: string };
type Window = { start: string; end: string; closed?: boolean };
type Closure = { date: string; professionalId: string; start?: string; end?: string };
type Settings = { weekly: Record<string, Window[]>; closures: Closure[] };
const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const hourlyWindows = (): Window[] => [9, 10, 11, 13, 14, 15, 16, 17, 18, 19].map(hour => ({ start: `${String(hour).padStart(2, '0')}:00`, end: `${String(hour + 1).padStart(2, '0')}:00` }));
const dayOpen = (windows: Window[] = []) => windows.some(w => !w.closed);
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
  const confirmedRows = rows.filter(row => row.status === 'confirmed');
  const change = async (id: string, status: string) => {
    if (!window.confirm(status === 'cancelled' ? 'Cancelar este agendamento? Um pagamento já realizado não será estornado automaticamente.' : 'Marcar atendimento como concluído?')) return;
    try { await call('admin_update', { id, status }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao atualizar.'); }
  };
  const selectedHours = (day: number) => hourlyWindows().filter(slot => (settings?.weekly[day] || []).some(w => !w.closed && w.start <= slot.start && w.end >= slot.end));
  const setHours = (day: number, windows: Window[]) => setSettings(prev => prev ? { ...prev, weekly: { ...prev.weekly, [day]: windows } } : prev);
  const toggleHour = (day: number, slot: Window) => {
    const current = selectedHours(day);
    const selected = current.some(w => w.start === slot.start);
    setHours(day, selected ? current.filter(w => w.start !== slot.start) : [...current, slot].sort((a, b) => a.start.localeCompare(b.start)));
  };
  const toggleSimpleDay = (day: number) => {
    const current = settings?.weekly[day] || [];
    if (dayOpen(current)) setHours(day, current.map(w => ({ ...w, closed: true })));
    else setHours(day, current.length ? current.map(w => ({ ...w, closed: false })) : hourlyWindows());
  };
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
      <div><h2 className="text-xl font-bold text-amber-400">{tab === 'horarios' ? 'Quando você vai atender?' : 'Precisa de uma folga?'}</h2><p className="text-sm text-zinc-300">{tab === 'horarios' ? 'Cada atendimento ocupa 1 hora. Toque no dia para abrir ou fechar e nos horários para liberar ou bloquear.' : 'Escolha o dia em que não vai atender. Você também pode bloquear só algumas horas.'}</p></div>
      {tab === 'horarios' && <>
        <div className="rounded-xl bg-amber-400/10 p-4 text-sm text-amber-200"><strong>9h às 20h · 1 hora por cliente</strong><p className="mt-1">Almoço: 12h às 13h. Último atendimento: 19h às 20h.</p></div>
        <button type="button" onClick={() => setSettings({ ...settings, weekly: { ...settings.weekly, ...Object.fromEntries([1,2,3,4,5,6].map(day => [String(day), hourlyWindows()])) } })} className="w-full rounded-xl border border-amber-400/50 px-4 py-3 font-semibold text-amber-300">Liberar todos os horários de segunda a sábado</button>
        <p className="text-sm text-zinc-400">Dourado = disponível. Cinza = bloqueado.</p>
        <div className="grid gap-4">{dayNames.map((name, day) => {
          const open = dayOpen(settings.weekly[day]);
          const hours = selectedHours(day);
          return <section key={name} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-lg">{name}</h3><button type="button" aria-pressed={open} onClick={() => toggleSimpleDay(day)} className={'rounded-lg px-4 py-2 text-sm font-bold ' + (open ? 'bg-emerald-800 text-white' : 'bg-zinc-800 text-zinc-300')}>{open ? 'Aberto' : 'Fechado'}</button></div>
            {open ? <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">{hourlyWindows().map(slot => {
              const selected = hours.some(w => w.start === slot.start);
              return <button key={slot.start} type="button" aria-pressed={selected} aria-label={slot.start + ' até ' + slot.end + (selected ? ', disponível' : ', bloqueado')} onClick={() => toggleHour(day, slot)} className={'rounded-lg border py-3 px-2 text-sm font-bold ' + (selected ? 'border-amber-400 bg-amber-400 text-black' : 'border-zinc-700 bg-zinc-900 text-zinc-400')}>{slot.start} – {slot.end}</button>;
            })}</div> : <p className="mt-2 text-sm text-zinc-500">Sem atendimento neste dia.</p>}
          </section>;
        })}</div>
        <p className="text-sm text-zinc-400">Após ajustar, toque em Salvar meus horários.</p>
      </>}
      {tab === 'folgas' && <div className="border-t border-zinc-800 pt-5 space-y-3"><h3 className="font-bold">Marcar uma folga</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0"><label className="grid min-w-0 gap-2 text-base font-semibold">Data<input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 p-3" /></label>
        <label className="grid min-w-0 gap-2 text-base font-semibold">Profissional<select value={blockProfessional} onChange={e => setBlockProfessional(e.target.value)} className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 p-3"><option value="all">Todos</option><option value="ray-black7">Ray Black7</option></select></label>
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
    <div className="grid gap-3">{confirmedRows.map(row => <article key={row.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
      <div className="flex flex-wrap justify-between gap-2"><strong>{new Date(row.start_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })} · {row.service_name}</strong><span className={row.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>{({pending_payment: 'Aguardando Pix', confirmed: 'Confirmado', completed: 'Atendido', cancelled: 'Cancelado', expired: 'Reserva vencida'} as Record<string,string>)[row.status] || row.status}</span></div>
      <p className="text-sm text-zinc-300">{row.professional_name} · R$ {(row.amount_cents / 100).toFixed(2).replace('.', ',')}</p>
      <p className="break-words text-sm text-zinc-300">{row.customer_name} · {row.customer_phone} · {row.customer_email}</p>
      <p className="break-all text-xs text-zinc-500">Código: {row.payment_reference}</p>
      {row.status === 'confirmed' && <div className="flex gap-2"><button onClick={() => change(row.id, 'completed')} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm">Concluir</button><button onClick={() => change(row.id, 'cancelled')} className="rounded-lg bg-zinc-700 px-3 py-2 text-sm">Cancelar</button></div>}
    </article>)}{!loading && !confirmedRows.length && <p className="text-zinc-400">Ainda não há agendamentos confirmados.</p>}</div></>}
  </div></AdminLayout>;
};
