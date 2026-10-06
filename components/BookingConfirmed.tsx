import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Crown, MapPin, MessageCircle, Bell, Clock } from 'lucide-react';
import { ADDRESS, WHATSAPP_RAW } from '../data/barbershop';
import { useStore } from '../context/StoreContext';

export type ConfirmedBooking = { service: string; professional: string; start: string; end?: string; customer?: string };
export function bookingCalendar(booking: ConfirmedBooking, reference: string) {
  const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  const stamp = (s: string) => new Date(s).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const finish = booking.end || new Date(Date.parse(booking.start) + 40 * 60000).toISOString();
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Studio Black7//Agenda//PT-BR', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', 'UID:' + reference + '@studioblack7', 'DTSTAMP:' + stamp(new Date().toISOString()),
    'DTSTART:' + stamp(booking.start), 'DTEND:' + stamp(finish),
    'SUMMARY:' + escape(booking.service + ' — Studio Black7'), 'LOCATION:' + escape(ADDRESS.full),
    'DESCRIPTION:' + escape('Atendimento com ' + booking.professional + '. Pagamento aprovado. Chegue 10 minutos antes.'),
    'BEGIN:VALARM', 'TRIGGER:-PT10M', 'ACTION:DISPLAY', 'DESCRIPTION:' + escape('Seu atendimento no Studio Black7 começa em 10 minutos.'),
    'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'];
  // Fold by UTF-8 octets so accented names remain valid in calendar apps.
  const encoder = new TextEncoder();
  return lines.map(line => {
    let result = '', chunk = '';
    for (const char of line) {
      if (encoder.encode(chunk + char).length > 74) { result += chunk + '\r\n'; chunk = ' '; }
      chunk += char;
    }
    return result + chunk;
  }).join('\r\n') + '\r\n';
}

export const BookingConfirmed: React.FC<{ booking: ConfirmedBooking; reference: string; amount: number; onNewBooking: () => void }> = ({ booking, reference, amount, onNewBooking }) => {
  const { settings } = useStore();
  const [now, setNow] = useState(Date.now());
  const [calendarSaved, setCalendarSaved] = useState(false);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = window.setInterval(update, 15000);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', update); };
  }, [booking.start]);
  const start = new Date(booking.start);
  const date = start.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
  const time = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  const remaining = start.getTime() - now;
  const soon = remaining > 0 && remaining <= 10 * 60000;
  const contact = (settings.whatsappRaw || settings.whatsapp || WHATSAPP_RAW).replace(/\D/g, '');
  const message = 'Olá! ' + (booking.customer ? 'Sou ' + booking.customer + '. ' : '') + 'Meu agendamento no Studio Black7 foi confirmado.\nServiço: ' + booking.service + '\nData: ' + date + '\nHorário: ' + time + '\nProfissional: ' + booking.professional + '\nReserva: ' + reference + '\nQuero falar sobre meu atendimento.';
  const saveCalendar = () => {
    const url = URL.createObjectURL(new Blob([bookingCalendar(booking, reference)], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'Studio-Black7-agendamento.ics'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000); setCalendarSaved(true);
  };
  return <div className="space-y-6 text-left">
    <div className="text-center space-y-3"><span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-300"><Crown size={16} /> Área VIP do cliente</span>
      <CheckCircle2 className="mx-auto text-emerald-400" size={44} /><h2 className="text-2xl sm:text-3xl font-bold">Agendamento confirmado!</h2>
      <p className="text-zinc-300">Pagamento aprovado. Seu horário está reservado{booking.customer ? ', ' + booking.customer.split(' ')[0] : ''}.</p></div>
    {soon && <div role="alert" className="rounded-2xl border border-amber-400 bg-amber-400/10 p-4"><strong className="flex items-center gap-2 text-amber-300"><Bell size={20} /> Seu atendimento está chegando!</strong><p className="mt-2">Faltam {Math.ceil(remaining / 60000)} minutos para {booking.service}, às {time}, com {booking.professional}.</p></div>}
    <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6 space-y-5">
      <h3 className="text-lg font-bold text-amber-300">{booking.service}</h3>
      <dl className="grid gap-4 sm:grid-cols-2"><div><dt className="flex gap-2 text-sm text-zinc-400"><CalendarDays size={17} /> Dia</dt><dd className="mt-1 font-semibold capitalize">{date}</dd></div>
        <div><dt className="flex gap-2 text-sm text-zinc-400"><Clock size={17} /> Horário de São Paulo</dt><dd className="mt-1 text-3xl font-bold">{time}</dd><dd className="mt-2 text-sm font-semibold text-amber-300">Chegue 10 minutos antes do seu corte.</dd></div>
        <div><dt className="text-sm text-zinc-400">Seu profissional</dt><dd className="mt-1 font-semibold">{booking.professional}</dd></div>
        <div><dt className="text-sm text-zinc-400">Valor pago por Pix</dt><dd className="mt-1 font-semibold text-emerald-300">{amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd></div></dl>
      <div className="border-t border-zinc-800 pt-4"><p className="flex items-center gap-2 text-sm text-zinc-400"><MapPin size={17} /> Onde será o atendimento</p><p className="mt-1">{ADDRESS.full}</p><a href={ADDRESS.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-amber-300 underline">Ver como chegar</a></div>
    </div>
    <a href={'https://wa.me/' + contact + '?text=' + encodeURIComponent(message)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-4 font-bold text-black"><MessageCircle size={21} /> Falar com o cabeleireiro no WhatsApp</a>
    <div className="rounded-2xl border border-zinc-700 p-5 space-y-3"><h3 className="flex items-center gap-2 font-bold"><Bell size={20} className="text-amber-300" /> Lembrete 10 minutos antes</h3>
      <p className="text-sm text-zinc-300">Salve na agenda do celular e confirme o alerta de 10 minutos no aplicativo de calendário.</p>
      <button type="button" onClick={saveCalendar} className="w-full rounded-xl border border-amber-400 px-4 py-3 font-bold text-amber-300">Salvar na minha agenda</button>
      {calendarSaved && <p role="status" className="text-sm text-amber-200">Abra o arquivo baixado, importe o evento e confira o lembrete de 10 minutos.</p>}
      <p className="text-xs text-zinc-400">O site também mostra um aviso quando faltarem 10 minutos, se esta página estiver aberta. O alerta com o site fechado depende da agenda e das notificações do seu celular.</p></div>
    <p className="text-sm text-zinc-300">Chegue 10 minutos antes. Para dúvidas ou alterações, fale com a equipe pelo botão acima.</p>
    <details className="text-xs text-zinc-500"><summary className="cursor-pointer">Identificação da reserva</summary><p className="mt-2 break-all">{reference}</p></details>
    <button type="button" onClick={onNewBooking} className="w-full rounded-xl border border-zinc-600 px-4 py-3 font-semibold">Agendar outro serviço</button>
  </div>;
};
