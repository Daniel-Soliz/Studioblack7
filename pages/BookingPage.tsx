import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header, Footer, FloatingWhatsApp } from '../components';
import { useStore } from '../context/StoreContext';
import { BookingConfirmed, ConfirmedBooking } from '../components/BookingConfirmed';
import { TEAM } from '../data/barbershop';

const api = 'https://oyghjlwujdmgfkopujip.supabase.co/functions/v1/appointments';
async function request(data: Record<string, unknown>) {
  const response = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Não foi possível concluir a operação.');
  return result;
}
const inSaoPaulo = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

export const BookingPage: React.FC = () => {
  const { services } = useStore();
  const [params] = useSearchParams();
  const [step, setStep] = useState(params.get('servico') ? 2 : 1);
  const previousStep = useRef(1);
  useEffect(() => {
    if (previousStep.current !== step) document.getElementById('booking-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    previousStep.current = step;
  }, [step]);
  const [serviceId, setServiceId] = useState(params.get('servico') || '');
  const [professionalId, setProfessionalId] = useState('ray-black7');
  const [date, setDate] = useState(() => params.get('servico') ? inSaoPaulo(new Date()) : '');
  const [time, setTime] = useState('');
  const [busy, setBusy] = useState<{ start: string; end: string }[]>([]);
  const [windows, setWindows] = useState<{ start: string; end: string }[]>([]);
  const [closures, setClosures] = useState<{ start?: string; end?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  type SavedPayment = { reference: string; qrCode?: string; qrCodeBase64?: string; ticketUrl?: string; amount: number; totalAmount?: number; remainingAmount?: number; booking?: ConfirmedBooking; savedStatus?: string };
  const readSavedPayments = (): SavedPayment[] => {
    try {
      const records = JSON.parse(localStorage.getItem('sb7-client-bookings') || '[]');
      const legacy = JSON.parse(sessionStorage.getItem('sb7-booking-payment') || 'null');
      const list = Array.isArray(records) ? records : [];
      if (legacy?.reference && !list.some(r => r.reference === legacy.reference)) list.unshift(legacy);
      return list.filter(r => /^[a-f0-9]{32}$/.test(r?.reference || '') && typeof r.amount === 'number').slice(0, 10);
    } catch { return []; }
  };
  const [savedPayments, setSavedPayments] = useState<SavedPayment[]>(readSavedPayments);
  const [payment, setPayment] = useState<SavedPayment | null>(null);
  const [paymentOption, setPaymentOption] = useState<'full' | 'half'>('full');
  const [status, setStatus] = useState('');
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [phone, setPhone] = useState('');
  const rememberPayment = (record: SavedPayment) => {
    setSavedPayments(previous => {
      const next = [record, ...previous.filter(r => r.reference !== record.reference)].slice(0, 10);
      try { localStorage.setItem('sb7-client-bookings', JSON.stringify(next)); } catch { /* Current payment remains usable if storage is unavailable. */ }
      return next;
    });
  };
  useEffect(() => {
    if (!payment) return;
    rememberPayment({ ...payment, savedStatus: status || payment.savedStatus || 'pending_payment' });
  }, [payment, status]);
  useEffect(() => {
    let active = true;
    const saved = readSavedPayments();
    if (!saved.length) return;
    void Promise.all(saved.map(async record => {
      try {
        const r = await request({ action: 'status', reference: record.reference });
        return { ...record, amount: r.amount ?? record.amount, totalAmount: r.totalAmount ?? record.totalAmount, remainingAmount: r.remainingAmount ?? record.remainingAmount, savedStatus: r.status,
          booking: r.service && r.start ? { ...record.booking, service: r.service, professional: r.professional, start: r.start } : record.booking };
      } catch { return record; }
    })).then(records => {
      if (!active) return;
      setSavedPayments(previous => {
        const next = previous.map(record => records.find(r => r.reference === record.reference) || record);
        try { localStorage.setItem('sb7-client-bookings', JSON.stringify(next)); sessionStorage.removeItem('sb7-booking-payment'); } catch {}
        return next;
      });
    });
    return () => { active = false; };
  }, []);
  const forgetPayment = (reference: string) => {
    setSavedPayments(previous => {
      const next = previous.filter(r => r.reference !== reference);
      try { localStorage.setItem('sb7-client-bookings', JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const service = services.find(s => s.id === serviceId);
  const today = inSaoPaulo(new Date());
  const maxDate = inSaoPaulo(new Date(Date.now() + 60 * 86400000));
  const options = useMemo(() => {
    if (!date || !service || loading) return [];
    const length = 60;
    const slots: string[] = [];
    for (const window of windows) {
      const begin = Number(window.start.slice(0, 2)) * 60 + Number(window.start.slice(3));
      const end = Number(window.end.slice(0, 2)) * 60 + Number(window.end.slice(3));
      for (let minute = begin; minute + length <= end; minute += 60) {
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
    if (!payment || ['confirmed', 'completed', 'expired', 'cancelled'].includes(status)) return;
    let active = true;
    let checking = false;
    let timer: number | undefined;
    const controller = new AbortController();
    const poll = async () => {
      if (!active || checking) return;
      if (timer !== undefined) window.clearTimeout(timer);
      checking = true;
      const started = Date.now();
      let terminal = false;
      try {
        const response = await fetch(api, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status', reference: payment.reference }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Consulta indisponível');
        const r = await response.json();
        if (active) {
          if (r.service && r.professional && r.start) {
            setPayment(current => current?.reference === payment.reference ? {
              ...current, amount: r.amount ?? current.amount, totalAmount: r.totalAmount ?? current.totalAmount, remainingAmount: r.remainingAmount ?? current.remainingAmount, booking: { ...current.booking, service: r.service, professional: r.professional, start: r.start },
            } : current);
          }
          setStatus(r.status);
          terminal = ['confirmed', 'completed', 'expired', 'cancelled'].includes(r.status);
        }
      } catch { /* Never confirm without an authoritative server response. */ }
      finally {
        checking = false;
        if (active && !terminal) timer = window.setTimeout(poll, Math.max(250, 2000 - (Date.now() - started)));
      }
    };
    const resume = () => { if (document.visibilityState === 'visible') void poll(); };
    void poll();
    window.addEventListener('focus', resume);
    document.addEventListener('visibilitychange', resume);
    return () => {
      active = false; controller.abort();
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener('focus', resume);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [payment?.reference, status]);

  const returnToServices = () => {
    setPayment(null); setStatus(''); setStep(1); setTime(''); setDate(''); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reserve = async (event: React.FormEvent) => {
    event.preventDefault(); if (step !== 3) return; setError(''); setLoading(true);
    try {
      const result = await request({ action: 'reserve', serviceId, professionalId, date, time, name, email, phone, paymentOption });
      const record: SavedPayment = { ...result, savedStatus: 'pending_payment', booking: {
        service: service?.name || '', professional: TEAM.find(p => p.id === professionalId)?.name || '',
        start: new Date(date + 'T' + time + ':00-03:00').toISOString(),
        end: new Date(Date.parse(date + 'T' + time + ':00-03:00') + 60 * 60000).toISOString(),
        customer: name.trim(),
      } }; rememberPayment(record); setPayment(record); setStatus('pending_payment');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao reservar.');
      if (date) request({ action: 'availability', date, professionalId }).then(r => { setBusy(r.busy || []); setWindows(r.intervals || []); setClosures(r.closures || []); }).catch(() => {});
    } finally { setLoading(false); }
  };

  return <div className="min-h-screen min-w-0 bg-[#08080a] text-white"><Header />
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 pt-32 pb-20">
      <p className="text-amber-400 text-xs font-bold uppercase tracking-[.25em]">Studio Black7</p>
      <h1 className="font-['Cinzel'] text-3xl sm:text-4xl font-black mt-2">{['confirmed', 'completed'].includes(status) ? 'Seu momento Black7' : 'Vamos marcar seu horário?'}</h1>
      <p className="text-zinc-400 mt-3">{['confirmed', 'completed'].includes(status) ? 'Todos os detalhes do seu atendimento em um só lugar.' : 'São só 3 passos. Escolha o serviço, marque o horário e informe seus dados.'}</p>
      {!payment && savedPayments.length > 0 && <section className="mt-8 rounded-2xl border border-amber-400/40 bg-zinc-900 p-4 sm:p-6 space-y-4">
        <h2 className="text-xl font-bold text-amber-300">Seus agendamentos neste celular</h2>
        <p className="text-sm text-zinc-300">Saiu para abrir o banco? Continue o Pix da reserva abaixo. Você não precisa começar de novo.</p>
        <div className="grid gap-3">{savedPayments.map(record => {
          const expired = ['expired', 'cancelled'].includes(record.savedStatus || '');
          const confirmed = ['confirmed', 'completed'].includes(record.savedStatus || '');
          return <article key={record.reference} className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 space-y-3">
            <div className="flex flex-wrap justify-between gap-2"><strong>{record.booking?.service || 'Seu agendamento'}</strong><span className={expired ? 'text-red-300' : confirmed ? 'text-emerald-300' : 'text-amber-300'}>{expired ? 'Pix vencido ou reserva cancelada' : confirmed ? 'Pagamento aprovado' : 'Pagamento não finalizado'}</span></div>
            {record.booking?.start && <p className="text-sm">{new Date(record.booking.start).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })}{record.booking.end && ' até ' + new Date(record.booking.end).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}</p>}
            <p className="text-sm text-zinc-300">Pix: R$ {record.amount.toFixed(2).replace('.', ',')}{Boolean(record.remainingAmount) && ' · restante no atendimento: R$ ' + record.remainingAmount!.toFixed(2).replace('.', ',')}</p>
            {!expired && <button type="button" onClick={() => { setStatus('checking'); setPayment(record); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-black">{confirmed ? 'Ver meu agendamento' : 'Continuar pagamento Pix'}</button>}
            {expired && <p className="text-sm text-zinc-400">Este Pix não deve mais ser pago. Escolha um novo horário abaixo.</p>}
            {expired && <button type="button" onClick={() => forgetPayment(record.reference)} className="text-sm text-zinc-400 underline">Remover da minha lista</button>}
          </article>;
        })}</div>
        <p className="text-xs text-zinc-400">A lista fica salva neste navegador. A confirmação e a validade do Pix são consultadas no sistema.</p>
      </section>}
      {payment ? <section className="mt-8 w-full min-w-0 rounded-2xl border border-amber-400/40 bg-zinc-900 p-5 sm:p-8 text-center space-y-5">
        {!['confirmed', 'completed'].includes(status) && <div className="text-left"><button type="button" onClick={returnToServices} className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 px-4 py-3 font-bold"><span aria-hidden="true">←</span> Voltar e escolher outro serviço</button><p className="mt-2 text-xs text-zinc-400">Se não quiser continuar, não pague este Pix. Voltar não cancela o código já gerado; ele vence em 30 minutos.</p></div>}
        {['confirmed', 'completed'].includes(status) ? payment.booking ? <BookingConfirmed booking={payment.booking} reference={payment.reference} amount={payment.amount} remainingAmount={payment.remainingAmount} onNewBooking={returnToServices} /> : <p role="status">Pagamento aprovado. Carregando os detalhes do agendamento...</p> : status === 'checking' ? <p role="status">Consultando sua reserva e a validade do Pix...</p> : ['expired', 'cancelled'].includes(status) ? <><h2 className="text-xl font-bold">Reserva expirada</h2><p>O horário foi liberado. Se você pagou, entre em contato com a equipe e informe o código {payment.reference}.</p><button type="button" onClick={() => setPayment(null)} className="rounded-xl bg-amber-400 px-5 py-3 text-black font-bold">Escolher outro horário</button></> : <>
          <h2 className="text-2xl font-bold text-amber-400">Pague R$ {payment.amount.toFixed(2).replace('.', ',')} por Pix</h2>
          {Boolean(payment.remainingAmount) && <p className="rounded-xl bg-amber-400/10 p-3 text-amber-200">Entrada de 50%. Restante de R$ {payment.remainingAmount!.toFixed(2).replace('.', ',')} para pagar no atendimento.</p>}
          <p className="text-sm text-zinc-300">Aguardando confirmação do Mercado Pago. Já pagou? Não pague novamente: estamos verificando automaticamente. O Pix vence em 30 minutos.</p>
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
        {step === 2 && <section className="space-y-4 min-w-0"><p className="rounded-xl bg-amber-400/10 p-3 font-bold text-amber-300">{service?.name} · {service?.price}</p><h2 className="text-xl font-bold">Qual dia fica bom para você?</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{Array.from({length: 7}, (_, i) => { const d = new Date(`${today}T12:00:00-03:00`); d.setUTCDate(d.getUTCDate() + i); const value = inSaoPaulo(d); return <button type="button" key={value} onClick={() => setDate(value)} aria-pressed={date === value} className={`rounded-xl border p-3 text-center ${date === value ? 'bg-amber-400 text-black border-amber-400' : 'bg-zinc-950 border-zinc-700'}`}><span className="block text-sm">{i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : d.toLocaleDateString('pt-BR', {weekday: 'short', timeZone: 'America/Sao_Paulo'})}</span><strong className="block text-lg">{d.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo'})}</strong></button>; })}</div>
          <label className="grid min-w-0 gap-2 font-semibold">Ou escolha outra data<input type="date" min={today} max={maxDate} value={date} onChange={e => { setDate(e.target.value); setError(''); }} className="block box-border w-full min-w-0 max-w-full rounded-xl bg-zinc-950 border border-zinc-700 p-3" /></label>
          {date && <div><h3 className="font-bold text-lg mb-3">Agora escolha a hora</h3><p className="mb-3 text-sm text-zinc-400">Cada atendimento dura 1 hora. Abaixo aparecem os horários disponíveis.</p>{loading ? <p role="status">Buscando horários...</p> : <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{options.map(hour => <button type="button" key={hour} onClick={() => setTime(hour)} aria-pressed={time === hour} className={`rounded-xl border py-3 text-base font-bold ${time === hour ? 'bg-amber-400 text-black border-amber-400' : 'bg-zinc-950 border-zinc-700'}`}>{hour} – {String(Number(hour.slice(0, 2)) + 1).padStart(2, '0')}:{hour.slice(3)}</button>)}</div>}{!loading && !options.length && <p className="text-zinc-300">Este dia está sem horários. Toque em outra data.</p>}</div>}
        </section>}
        {step === 3 && <section className="space-y-4 min-w-0"><h2 className="text-xl font-bold">Como podemos falar com você?</h2>
          <label className="grid min-w-0 gap-2 font-semibold">Seu nome completo<input required autoComplete="name" placeholder="Digite seu nome completo" minLength={2} value={name} onChange={e => setName(e.target.value)} className="box-border w-full min-w-0 max-w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-base" /></label>
          <label className="grid min-w-0 gap-2 font-semibold">Seu telefone ou WhatsApp<input required autoComplete="tel" inputMode="tel" type="tel" placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} className="box-border w-full min-w-0 max-w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-base" /></label>
          <label className="grid min-w-0 gap-2 font-semibold">E-mail para o pagamento Pix<input required autoComplete="email" type="email" placeholder="seuemail@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} className="box-border w-full min-w-0 max-w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-base" /><span className="text-sm font-normal text-zinc-400">O Mercado Pago pede este dado para gerar o Pix.</span></label>
          <fieldset className="space-y-3"><legend className="text-lg font-bold mb-3">Como você quer pagar?</legend><div className="grid gap-3 sm:grid-cols-2">{(['half', 'full'] as const).map(option => {
            const total = Math.round(Number(service?.priceNumber || 0) * 100);
            const cents = option === 'half' ? Math.ceil(total / 2) : total;
            const unavailable = cents < 100;
            return <label key={option} className={`flex gap-3 items-start rounded-xl border-2 p-4 ${unavailable ? 'opacity-40' : paymentOption === option ? 'border-amber-400 bg-amber-400/10' : 'border-zinc-700 bg-zinc-950'}`}><input type="radio" name="paymentOption" value={option} checked={paymentOption === option} disabled={unavailable || loading} onChange={() => setPaymentOption(option)} className="mt-1 accent-amber-400" /><span><strong className="block">{option === 'half' ? 'Pagar 50% agora' : 'Pagar valor completo'}</strong><span className="block mt-1 text-amber-300">R$ {(cents / 100).toFixed(2).replace('.', ',')}</span><span className="block mt-2 text-sm text-zinc-400">{unavailable ? 'Pix mínimo de R$ 1,00.' : option === 'half' ? 'Restante de R$ ' + ((total - cents) / 100).toFixed(2).replace('.', ',') + ' no atendimento.' : 'Tudo pago. Sem saldo restante.'}</span></span></label>;
          })}</div></fieldset>
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 space-y-1"><strong className="block">Confira seu agendamento</strong><p>{service?.name} · {service?.price}</p><p>{date.split('-').reverse().join('/')} às {time}</p><p className="text-sm text-zinc-400">{TEAM.find(p => p.id === professionalId)?.name}</p></div>
        </section>}
        {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">{step > 1 && <button type="button" onClick={() => { setStep(step - 1); setError(''); }} className="rounded-xl border border-zinc-600 px-5 py-4 font-bold">Voltar</button>}{step < 3 ? <button type="button" disabled={step === 1 ? !serviceId : loading || !date || !time} onClick={() => { setStep(step + 1); setError(''); }} className="flex-1 rounded-xl bg-amber-400 px-5 py-4 font-black text-black disabled:opacity-40">Continuar</button> : <button type="submit" disabled={loading || !serviceId || !date || !time} className="flex-1 rounded-xl bg-amber-400 px-5 py-4 font-black text-black disabled:opacity-40">{loading ? 'Aguarde...' : 'Confirmar e pagar com Pix'}</button>}</div>

      </form>}
    </main><Footer /><FloatingWhatsApp /></div>;
};
