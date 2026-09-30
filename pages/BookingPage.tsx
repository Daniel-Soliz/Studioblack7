import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [step, setStep] = useState(1);
  const previousStep = useRef(1);
  useEffect(() => {
    if (previousStep.current !== step) document.getElementById('booking-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    previousStep.current = step;
  }, [step]);
  const [serviceId, setServiceId] = useState(params.get('servico') || '');
  const [professionalId, setProfessionalId] = useState('ray-black7');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [busy, setBusy] = useState<{ start: string; end: string }[]>([]);
  const [windows, setWindows] = useState<{ start: string; end: string }[]>([]);
  const [closures, setClosures] = useState<{ start?: string; end?: string }[]>([]);
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
    if (!date || !service || loading) return [];
    const length = Math.max(20, Math.min(180, minutes(service.duration)));
    const slots: string[] = [];
    for (const window of windows) {
      const begin = Number(window.start.slice(0, 2)) * 60 + Number(window.start.slice(3));
      const end = Number(window.end.slice(0, 2)) * 60 + Number(window.end.slice(3));
      for (let minute = begin; minute + length <= end; minute += 30) {
        const hour = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
        const start = new Date(`${date}T${hour}:00-03:00`).getTime();
        const finish = start + length * 60000;
        const closed = closures.some(c => !c.start || !c.end || minute < Number(c.end.slice(0, 2)) * 60 + Number(c.end.slice(3)) && minute + length > Number(c.start.slice(0, 2)) * 60 + Number(c.start.slice(3)));
        if (start > Date.now() + 30 * 60000 && !closed && !busy.some(b => start < Date.parse(b.end) && finish > Date.parse(b.start))) slots.push(hour);
      }
    }
    return slots;
  }, [date, service, busy, windows, closures, loading]);

  useEffect(() => {
    setTime('');
    if (!date || !professionalId) return;
    let active = true;
    setLoading(true); setBusy([]); setWindows([]); setClosures([]);
    request({ action: 'availability', date, professionalId }).then(r => { if (active) { setBusy(r.busy || []); setWindows(r.intervals || []); setClosures(r.closures || []); setError(''); } }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
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
    event.preventDefault(); if (step !== 3) return; setError(''); setLoading(true);
    try {
      const result = await request({ action: 'reserve', serviceId, professionalId, date, time, name, email, phone });
      setPayment(result); setStatus('pending_payment');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao reservar.');
      if (date) request({ action: 'availability', date, professionalId }).then(r => { setBusy(r.busy || []); setWindows(r.intervals || []); setClosures(r.closures || []); }).catch(() => {});
    } finally { setLoading(false); }
  };

  return <div className="min-h-screen min-w-0 bg-[#08080a] text-white"><Header />
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 pt-32 pb-20">
      <p className="text-amber-400 text-xs font-bold uppercase tracking-[.25em]">Studio Black7</p>
      <h1 className="font-['Cinzel'] text-3xl sm:text-4xl font-black mt-2">Vamos marcar seu horário?</h1>
      <p className="text-zinc-400 mt-3">São só 3 passos. Escolha o serviço, marque o horário e informe seus dados.</p>
      {payment ? <section className="mt-8 w-full min-w-0 rounded-2xl border border-amber-400/40 bg-zinc-900 p-5 sm:p-8 text-center space-y-5">
        {status === 'confirmed' ? <><h2 className="text-2xl text-emerald-400 font-bold">Agendamento confirmado!</h2><p>Seu pagamento foi aprovado. Guarde o código {payment.reference}.</p></> : status === 'expired' ? <><h2 className="text-xl font-bold">Reserva expirada</h2><p>O horário foi liberado. Se você pagou, entre em contato com a equipe e informe o código {payment.reference}.</p><button type="button" onClick={() => setPayment(null)} className="rounded-xl bg-amber-400 px-5 py-3 text-black font-bold">Escolher outro horário</button></> : <>
          <h2 className="text-2xl font-bold text-amber-400">Pague R$ {payment.amount.toFixed(2).replace('.', ',')} por Pix</h2>
          <p className="text-sm text-zinc-300">Aguardando confirmação do Mercado Pago. O Pix vence em 30 minutos.</p>
          {payment.qrCodeBase64 && <img className="mx-auto w-60 h-60 rounded-lg bg-white p-2" alt="QR Code Pix" src={`data:image/png;base64,${payment.qrCodeBase64}`} />}
          {payment.qrCode && <><textarea readOnly value={payment.qrCode} className="block w-full min-w-0 max-w-full h-24 rounded-xl bg-black p-3 text-xs text-zinc-200" aria-label="Código Pix copia e cola" /><button type="button" onClick={() => navigator.clipboard.writeText(payment.qrCode || '')} className="rounded-xl bg-amber-400 px-5 py-3 text-black font-bold">Copiar código Pix</button></>}
          {payment.ticketUrl && <p><a href={payment.ticketUrl} target="_blank" rel="noopener noreferrer" className="underline text-amber-300">Abrir pagamento no Mercado Pago</a></p>}
          <p className="break-all text-xs text-zinc-500">Código da reserva: {payment.reference}</p>
        </>}
      </section> : <form onSubmit={reserve} className="mt-8 grid w-full min-w-0 max-w-full gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-8">
        <div id="booking-steps" className="scroll-mt-32 flex items-center gap-2" aria-label={`Etapa ${step} de 3`}>{['Serviço', 'Horário', 'Seus dados'].map((label, i) => <span key={label} className={`flex-1 rounded-lg px-2 py-3 text-center text-sm font-bold ${step === i + 1 ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{i + 1}. {label}</span>)}</div>
        {step === 1 && <section className="space-y-4 min-w-0">
          <h2 className="text-xl font-bold">O que você quer fazer?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{services.filter(s => s.status !== 'inactive' && Number(s.priceNumber) > 0).map(s => <button type="button" key={s.id} aria-pressed={serviceId === s.id} onClick={() => { setServiceId(s.id); setTime(''); }} className={`rounded-xl border-2 p-4 text-left min-w-0 ${serviceId === s.id ? 'border-amber-400 bg-amber-400/10' : 'border-zinc-700 bg-zinc-950'}`}><span className="block text-lg font-bold break-words">{s.name}</span><span className="mt-1 block text-amber-300 font-semibold">{s.price}</span></button>)}</div>
          <details className="rounded-xl bg-zinc-950 p-4"><summary className="cursor-pointer font-semibold">Quem vai atender? {TEAM.find(p => p.id === professionalId)?.name}</summary><div className="grid gap-2 mt-3">{TEAM.map(p => <button type="button" key={p.id} onClick={() => setProfessionalId(p.id)} aria-pressed={professionalId === p.id} className={`rounded-lg border p-3 text-left ${professionalId === p.id ? 'border-amber-400 text-amber-300' : 'border-zinc-700'}`}>{p.name}</button>)}</div></details>
        </section>}
        {step === 2 && <section className="space-y-4 min-w-0"><h2 className="text-xl font-bold">Qual dia fica bom para você?</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{Array.from({length: 7}, (_, i) => { const d = new Date(`${today}T12:00:00-03:00`); d.setUTCDate(d.getUTCDate() + i); const value = inSaoPaulo(d); return <button type="button" key={value} onClick={() => setDate(value)} aria-pressed={date === value} className={`rounded-xl border p-3 text-center ${date === value ? 'bg-amber-400 text-black border-amber-400' : 'bg-zinc-950 border-zinc-700'}`}><span className="block text-sm">{i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : d.toLocaleDateString('pt-BR', {weekday: 'short', timeZone: 'America/Sao_Paulo'})}</span><strong className="block text-lg">{d.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo'})}</strong></button>; })}</div>
          <label className="grid min-w-0 gap-2 font-semibold">Ou escolha outra data<input type="date" min={today} max={maxDate} value={date} onChange={e => { setDate(e.target.value); setError(''); }} className="block box-border w-full min-w-0 max-w-full rounded-xl bg-zinc-950 border border-zinc-700 p-3" /></label>
          {date && <div><h3 className="font-bold text-lg mb-3">Agora escolha a hora</h3>{loading ? <p role="status">Buscando horários...</p> : <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{options.map(hour => <button type="button" key={hour} onClick={() => setTime(hour)} aria-pressed={time === hour} className={`rounded-xl border py-3 text-base font-bold ${time === hour ? 'bg-amber-400 text-black border-amber-400' : 'bg-zinc-950 border-zinc-700'}`}>{hour}</button>)}</div>}{!loading && !options.length && <p className="text-zinc-300">Este dia está sem horários. Toque em outra data.</p>}</div>}
        </section>}
        {step === 3 && <section className="space-y-4 min-w-0"><h2 className="text-xl font-bold">Como podemos falar com você?</h2>
          <label className="grid min-w-0 gap-2 font-semibold">Seu nome<input required autoComplete="name" placeholder="Digite seu nome" minLength={2} value={name} onChange={e => setName(e.target.value)} className="box-border w-full min-w-0 max-w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-base" /></label>
          <label className="grid min-w-0 gap-2 font-semibold">Seu telefone ou WhatsApp<input required autoComplete="tel" inputMode="tel" type="tel" placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} className="box-border w-full min-w-0 max-w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-base" /></label>
          <label className="grid min-w-0 gap-2 font-semibold">E-mail para o pagamento Pix<input required autoComplete="email" type="email" placeholder="seuemail@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} className="box-border w-full min-w-0 max-w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-base" /><span className="text-sm font-normal text-zinc-400">O Mercado Pago pede este dado para gerar o Pix.</span></label>
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 space-y-1"><strong className="block">Confira seu agendamento</strong><p>{service?.name} · {service?.price}</p><p>{date.split('-').reverse().join('/')} às {time}</p><p className="text-sm text-zinc-400">{TEAM.find(p => p.id === professionalId)?.name}</p></div>
        </section>}
        {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">{step > 1 && <button type="button" onClick={() => { setStep(step - 1); setError(''); }} className="rounded-xl border border-zinc-600 px-5 py-4 font-bold">Voltar</button>}{step < 3 ? <button type="button" disabled={step === 1 ? !serviceId : loading || !date || !time} onClick={() => { setStep(step + 1); setError(''); }} className="flex-1 rounded-xl bg-amber-400 px-5 py-4 font-black text-black disabled:opacity-40">Continuar</button> : <button type="submit" disabled={loading || !serviceId || !date || !time} className="flex-1 rounded-xl bg-amber-400 px-5 py-4 font-black text-black disabled:opacity-40">{loading ? 'Aguarde...' : 'Confirmar e pagar com Pix'}</button>}</div>

      </form>}
    </main><Footer /><FloatingWhatsApp /></div>;
};
