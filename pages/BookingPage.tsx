import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header, Footer, FloatingWhatsApp } from '../components';
import { useStore } from '../context/StoreContext';
import { TEAM } from '../data/barbershop';

const api = 'https://oyghjlwujdmgfkopujip.supabase.co/functions/v1/appointments';
async function request(data: Record<string, unknown>) {
  const response = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Não foi possível concluir a operação.');
  return result;
}
const inSaoPaulo = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const minutes = (duration?: string) => duration?.includes(':') ? Number(duration.split(':')[0]) * 60 + Number(duration.split(':')[1]) : Number.parseInt(duration || '40', 10) || 40;

export const BookingPage: React.FC = () => {
  const { services } = useStore();
  const [params] = useSearchParams();
  const [serviceId, setServiceId] = useState(params.get('servico') || '');
  const [professionalId, setProfessionalId] = useState('ray-black7');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [busy, setBusy] = useState<{ start: string; end: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<{ reference: string; qrCode?: string; qrCodeBase64?: string; ticketUrl?: string; amount: number } | null>(() => {
    try { const saved = sessionStorage.getItem('sb7-booking-payment'); return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [status, setStatus] = useState('');
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [phone, setPhone] = useState('');
  useEffect(() => {
    if (payment) sessionStorage.setItem('sb7-booking-payment', JSON.stringify(payment));
    else sessionStorage.removeItem('sb7-booking-payment');
  }, [payment]);
  const service = services.find(s => s.id === serviceId);
  const today = inSaoPaulo(new Date());
  const maxDate = inSaoPaulo(new Date(Date.now() + 60 * 86400000));
  const options = useMemo(() => {
    if (!date || !service || new Date(`${date}T12:00:00-03:00`).getUTCDay() === 0) return [];
    const length = Math.max(20, Math.min(180, minutes(service.duration)));
    const slots: string[] = [];
    for (const [begin, end] of [[540, 720], [810, 1260]]) {
      for (let minute = begin; minute + length <= end; minute += 30) {
        const hour = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
        const start = new Date(`${date}T${hour}:00-03:00`).getTime();
        const finish = start + length * 60000;
        if (start > Date.now() + 30 * 60000 && !busy.some(b => start < Date.parse(b.end) && finish > Date.parse(b.start))) slots.push(hour);
      }
    }
    return slots;
  }, [date, service, busy]);

  useEffect(() => {
    setTime('');
    if (!date || !professionalId) return;
    let active = true;
    setLoading(true);
    request({ action: 'availability', date, professionalId }).then(r => { if (active) setBusy(r.busy || []); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date, professionalId]);

  useEffect(() => {
    if (!payment || status === 'confirmed' || status === 'expired') return;
    let active = true;
    const poll = async () => {
      try {
        const r = await request({ action: 'status', reference: payment.reference });
        if (active) setStatus(r.status);
      } catch { /* Keep the Pix visible if status check temporarily fails. */ }
    };
    void poll();
    const timer = window.setInterval(poll, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [payment, status]);

  const reserve = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const result = await request({ action: 'reserve', serviceId, professionalId, date, time, name, email, phone });
      setPayment(result); setStatus('pending_payment');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao reservar.');
      if (date) request({ action: 'availability', date, professionalId }).then(r => setBusy(r.busy || [])).catch(() => {});
    } finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-[#08080a] text-white"><Header />
    <main className="mx-auto max-w-4xl px-4 pt-32 pb-20">
      <p className="text-amber-400 text-xs font-bold uppercase tracking-[.25em]">Studio Black7</p>
      <h1 className="font-['Cinzel'] text-3xl sm:text-4xl font-black mt-2">Agende e pague seu horário</h1>
      <p className="text-zinc-400 mt-3">Escolha o atendimento e pague com Pix. O horário é confirmado após a aprovação do pagamento.</p>
      {payment ? <section className="mt-8 rounded-2xl border border-amber-400/40 bg-zinc-900 p-6 sm:p-8 text-center space-y-5">
        {status === 'confirmed' ? <><h2 className="text-2xl text-emerald-400 font-bold">Agendamento confirmado!</h2><p>Seu pagamento foi aprovado. Guarde o código {payment.reference}.</p></> : status === 'expired' ? <><h2 className="text-xl font-bold">Reserva expirada</h2><p>O horário foi liberado. Se você pagou, entre em contato com a equipe e informe o código {payment.reference}.</p><button type="button" onClick={() => setPayment(null)} className="rounded-xl bg-amber-400 px-5 py-3 text-black font-bold">Escolher outro horário</button></> : <>
          <h2 className="text-2xl font-bold text-amber-400">Pague R$ {payment.amount.toFixed(2).replace('.', ',')} por Pix</h2>
          <p className="text-sm text-zinc-300">Aguardando confirmação do Mercado Pago. O Pix vence em 30 minutos.</p>
          {payment.qrCodeBase64 && <img className="mx-auto w-60 h-60 rounded-lg bg-white p-2" alt="QR Code Pix" src={`data:image/png;base64,${payment.qrCodeBase64}`} />}
          {payment.qrCode && <><textarea readOnly value={payment.qrCode} className="w-full h-24 rounded-xl bg-black p-3 text-xs text-zinc-200" aria-label="Código Pix copia e cola" /><button type="button" onClick={() => navigator.clipboard.writeText(payment.qrCode || '')} className="rounded-xl bg-amber-400 px-5 py-3 text-black font-bold">Copiar código Pix</button></>}
          {payment.ticketUrl && <p><a href={payment.ticketUrl} target="_blank" rel="noopener noreferrer" className="underline text-amber-300">Abrir pagamento no Mercado Pago</a></p>}
          <p className="text-xs text-zinc-500">Código da reserva: {payment.reference}</p>
        </>}
      </section> : <form onSubmit={reserve} className="mt-8 grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-8">
        <label className="grid gap-2 text-sm font-bold">1. Serviço<select required value={serviceId} onChange={e => setServiceId(e.target.value)} className="rounded-xl bg-zinc-950 border border-zinc-700 p-3"><option value="">Selecione o serviço</option>{services.filter(s => s.status !== 'inactive' && Number(s.priceNumber) > 0).map(s => <option key={s.id} value={s.id}>{s.name} · {s.price} · {s.duration || '40 min'}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-bold">2. Profissional<select value={professionalId} onChange={e => setProfessionalId(e.target.value)} className="rounded-xl bg-zinc-950 border border-zinc-700 p-3">{TEAM.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-bold">3. Data<input required type="date" min={today} max={maxDate} value={date} onChange={e => { setDate(e.target.value); setError(''); }} className="rounded-xl bg-zinc-950 border border-zinc-700 p-3" /></label>
        {date && <div><p className="font-bold text-sm mb-3">4. Horário disponível {loading ? '· Carregando...' : ''}</p><div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{options.map(hour => <button key={hour} type="button" onClick={() => setTime(hour)} className={`rounded-lg border p-2.5 text-sm ${time === hour ? 'bg-amber-400 text-black border-amber-400' : 'border-zinc-700 bg-zinc-950 text-white'}`}>{hour}</button>)}</div>{!loading && !options.length && <p className="text-sm text-zinc-400">Sem horários nesta data. Escolha outro dia.</p>}</div>}
        <div className="grid sm:grid-cols-2 gap-4"><label className="grid gap-2 text-sm">Nome<input required minLength={2} value={name} onChange={e => setName(e.target.value)} className="rounded-xl bg-zinc-950 border border-zinc-700 p-3" /></label><label className="grid gap-2 text-sm">Telefone<input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="rounded-xl bg-zinc-950 border border-zinc-700 p-3" /></label></div>
        <label className="grid gap-2 text-sm">E-mail para contato<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl bg-zinc-950 border border-zinc-700 p-3" /></label>
        {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading || !serviceId || !date || !time} className="rounded-xl bg-amber-400 px-6 py-4 font-black text-zinc-950 disabled:opacity-50">{loading ? 'Aguarde...' : 'Reservar horário e gerar Pix'}</button>
      </form>}
    </main><Footer /><FloatingWhatsApp /></div>;
};
