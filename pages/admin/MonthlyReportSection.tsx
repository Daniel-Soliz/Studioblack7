import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

type Summary = { visits: number; visitors: number; scheduled: number; confirmed: number; completed: number; pending: number; cancelled: number; bookedAmount: number; serviceRevenue: number; productUnits: number; paidOrders: number; pendingOrders: number; productRevenue: number; shippingRevenue: number; totalReceived: number };
type ServiceRow = { id: string; name: string; scheduled: number; completed: number; pending: number; booked_amount: number; received: number; min_price: number; max_price: number };
type ProductRow = { id: string; name: string; quantity: number; amount: number };
type DayRow = { day: string; visits: number; scheduled: number; productUnits: number };
type MonthRow = { month: string; visits: number; scheduled: number; productUnits: number };
export type DashboardReport = { month: string; generatedAt: string; trackingStartedAt: string | null; summary: Summary; services: ServiceRow[]; products: ProductRow[]; daily: DayRow[]; monthly: MonthRow[] };
const money = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n) || 0);
const number = (n: number) => new Intl.NumberFormat('pt-BR').format(Number(n) || 0);
const monthLabel = (month: string) => new Date(month + '-01T12:00:00-03:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
const currentMonth = () => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date()).slice(0, 7);

// A downloadable PDF with embedded standard fonts; all offsets use ASCII bytes.
export function buildReportPdf(report: DashboardReport): Uint8Array {
  const s = report.summary;
  const lines: string[] = [
    'RELATORIO MENSAL | ' + monthLabel(report.month),
    'Gerado em: ' + new Date(report.generatedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    '',
    'RESUMO DO MES',
    'Acessos (visitas): ' + number(s.visits) + ' | Visitantes estimados: ' + number(s.visitors),
    'Agendamentos: ' + number(s.scheduled) + ' | Confirmados: ' + number(s.confirmed),
    'Atendidos: ' + number(s.completed) + ' | Aguardando Pix: ' + number(s.pending),
    'Cancelados / expirados: ' + number(s.cancelled),
    'Valor agendado: ' + money(s.bookedAmount),
    'Recebido em servicos: ' + money(s.serviceRevenue),
    'Produtos vendidos: ' + number(s.productUnits) + ' unidades em ' + number(s.paidOrders) + ' pedidos pagos',
    'Recebido em produtos: ' + money(s.productRevenue) + ' | Frete: ' + money(s.shippingRevenue),
    'TOTAL RECEBIDO (servicos + pedidos pagos): ' + money(s.totalReceived),
    '',
    'SERVICOS | quantidade, preco e total',
    ...report.services.flatMap(r => [r.name,
      'Agendados: ' + number(r.scheduled) + ' | Atendidos: ' + number(r.completed) + ' | Pendentes: ' + number(r.pending),
      'Preco: ' + (r.min_price === r.max_price ? money(r.min_price) : money(r.min_price) + ' a ' + money(r.max_price)),
      'Total agendado: ' + money(r.booked_amount) + ' | Recebido: ' + money(r.received), '']),
    ...(report.services.length ? [] : ['Nenhum servico neste mes.', '']),
    'PRODUTOS VENDIDOS | somente pedidos pagos',
    ...report.products.flatMap(r => [r.name, 'Unidades: ' + number(r.quantity) + ' | Total: ' + money(r.amount)]),
    ...(report.products.length ? [] : ['Nenhum produto vendido neste mes.']),
    '', 'COMPARACAO DOS ULTIMOS SEIS MESES',
    ...report.monthly.map(r => monthLabel(r.month) + ' | Visitas: ' + number(r.visits) + ' | Agendados: ' + number(r.scheduled) + ' | Produtos: ' + number(r.productUnits)),
    '', 'MOVIMENTO DIARIO | visitas / agendamentos / produtos',
    ...report.daily.map(r => r.day.split('-').reverse().join('/') + ' | ' + r.visits + ' / ' + r.scheduled + ' / ' + r.productUnits),
    '', 'CRITERIOS DO RELATORIO',
    'Servicos por data de atendimento; loja por data de criacao do pedido.',
    'Agendamentos incluem Pix pendente, confirmados e atendidos.',
    'Receita de servicos inclui pagamentos registrados como pagos.',
    'Produtos vendidos incluem apenas pedidos pagos e nao cancelados.',
    'Pedidos cancelados e pagamentos pendentes nao entram nas vendas.',
    'Visita: sessao do navegador, renovada apos 30 minutos sem navegacao.',
    'Visitante unico: navegador identificado; nao equivale a pessoa identificada.',
    'Acessos do ADM nao sao contados. Nao ha visitas retroativas.',
    'Inicio da contagem: ' + (report.trackingStartedAt ? new Date(report.trackingStartedAt).toLocaleDateString('pt-BR') : 'aguardando o primeiro acesso'),
  ];
  const wrapped = lines.flatMap(line => {
    const words = line.replace(/[–—]/g, '-').replace(/\u00a0/g, ' ').split(' ');
    const result: string[] = []; let current = '';
    for (const word of words) { if ((current + ' ' + word).length > 88) { result.push(current); current = word; } else current += (current ? ' ' : '') + word; }
    result.push(current); return result;
  });
  const escape = (value: string) => Array.from(value).map(char => {
    const n = char.charCodeAt(0);
    if (char === '(' || char === ')' || char === '\\') return '\\' + char;
    if (n >= 128 && n <= 255) return '\\' + n.toString(8).padStart(3, '0');
    return n >= 32 && n < 127 ? char : ' ';
  }).join('');
  const pages: string[][] = [];
  for (let i = 0; i < wrapped.length; i += 42) pages.push(wrapped.slice(i, i + 42));
  const objects: string[] = ['', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
  const pageIds: number[] = [];
  pages.forEach((page, index) => {
    const pageId = objects.length + 1, streamId = pageId + 1; pageIds.push(pageId);
    const header = '0.07 0.07 0.08 rg 0 755 595 87 re f 0.94 0.7 0.18 rg BT /F2 20 Tf 40 798 Td (STUDIO BLACK7) Tj ET';
    const content = page.map((line, i) => {
      const heading = /^[A-Z][A-Z 0-9|/()]+$/.test(line) || line.startsWith('TOTAL RECEBIDO');
      return (i % 2 === 0 ? '0.96 0.96 0.96 rg 35 ' + (717 - i * 15) + ' 525 15 re f ' : '') +
        '0.12 0.12 0.13 rg BT /' + (heading ? 'F2' : 'F1') + ' 10 Tf 40 ' + (722 - i * 15) + ' Td (' + escape(line) + ') Tj ET';
    }).join('\n');
    const footer = '0.4 0.4 0.4 rg BT /F1 9 Tf 40 40 Td (Studio Black7 | ' + escape(report.month) + ' | Pagina ' + (index + 1) + ' de ' + pages.length + ') Tj ET';
    const stream = header + '\n' + content + '\n' + footer;
    objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + streamId + ' 0 R >>');
    objects.push('<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');
  });
  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[1] = '<< /Type /Pages /Kids [' + pageIds.map(id => id + ' 0 R').join(' ') + '] /Count ' + pages.length + ' >>';
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((obj, i) => { offsets.push(pdf.length); pdf += (i + 1) + ' 0 obj\n' + obj + '\nendobj\n'; });
  const xref = pdf.length;
  pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n' + offsets.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
  return new TextEncoder().encode(pdf);
}
export const MonthlyReportSection: React.FC = () => {
  const { session } = useAuth();
  const [month, setMonth] = useState(currentMonth);
  const latestMonth = useRef(month); latestMonth.current = month;
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [metric, setMetric] = useState<'visits' | 'scheduled' | 'productUnits'>('visits');
  const refresh = useCallback(async () => {
    if (!session?.token) return;
    setLoading(true);
    try {
      const response = await fetch('https://oyghjlwujdmgfkopujip.supabase.co/functions/v1/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'admin_report', token: session.token, month }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Não foi possível carregar o relatório.');
      if (data.report?.month !== month) throw new Error('O relatório retornou um período diferente.');
      if (latestMonth.current !== month) return;
      setReport(data.report); setError('');
    } catch (e) { if (latestMonth.current !== month) return; setError(e instanceof Error ? e.message : 'Falha ao carregar o relatório.'); }
    finally { if (latestMonth.current === month) setLoading(false); }
  }, [month, session?.token]);
  useEffect(() => { setReport(null); void refresh(); const timer = window.setInterval(refresh, 30000); return () => window.clearInterval(timer); }, [refresh]);
  const download = () => {
    if (!report || report.month !== month || error) return;
    const bytes = buildReportPdf(report);
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'Studio-Black7-relatorio-' + month + '.pdf'; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  const s = report?.summary;
  const max = Math.max(1, ...(report?.daily.map(d => d[metric]) || []));
  const card = (title: string, value: string, detail: string) => <article key={title} className="min-w-0 rounded-2xl border border-zinc-700 bg-zinc-900 p-5"><p className="text-sm text-zinc-300">{title}</p><strong className="mt-2 block break-words text-2xl sm:text-3xl text-amber-300">{value}</strong><p className="mt-2 text-xs text-zinc-400">{detail}</p></article>;
  return <section className="min-w-0 space-y-6 text-zinc-100">
    <div><h2 className="font-['Cinzel'] text-xl font-black text-white">Agendamentos e faturamento</h2><p className="mt-2 text-sm text-zinc-400">Valores recebidos e serviços agendados. O lucro líquido depende dos custos e despesas, ainda não cadastrados.</p></div>
    <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-zinc-900 p-4"><label className="grid min-w-0 gap-2 font-semibold">Mês do relatório<input type="month" min="2000-01" value={month} max={currentMonth()} onChange={e => { if (e.target.value) setMonth(e.target.value); }} className="w-full min-w-0 rounded-xl border border-zinc-600 bg-zinc-950 p-3" /></label><button type="button" disabled={loading} onClick={() => void refresh()} className="rounded-xl border border-zinc-600 px-5 py-3 disabled:opacity-50">{loading ? 'Atualizando...' : 'Atualizar'}</button><button type="button" disabled={!report || report.month !== month || loading || Boolean(error)} onClick={download} className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-black disabled:opacity-40">Baixar relatório em PDF</button></div>
    {error && <p role="alert" className="rounded-xl border border-red-500/40 p-4 text-red-300">{error} Tente atualizar novamente.</p>}
    {!report && !error && <p role="status" className="text-zinc-300">Carregando dados reais do mês...</p>}
    {report && s && <>
      <div className="flex flex-wrap justify-between gap-2 text-sm text-zinc-400"><span className="capitalize">{monthLabel(report.month)}</span><span>Atualizado às {new Date(report.generatedAt).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })} · atualização a cada 30 segundos</span></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {card('Acessos ao site', number(s.visits), 'Visitas ao site público; páginas do ADM excluídas.')}
        {card('Visitantes únicos estimados', number(s.visitors), 'Contagem por navegador, sem identificar pessoas.')}
        {card('Total de agendamentos', number(s.scheduled), number(s.confirmed) + ' confirmados · ' + number(s.pending) + ' aguardando Pix')}
        {card('Recebido em serviços', money(s.serviceRevenue), number(s.completed) + ' atendimentos concluídos no mês')}
        {card('Produtos vendidos', number(s.productUnits), number(s.paidOrders) + ' pedidos pagos · ' + money(s.productRevenue) + ' em produtos')}
        {card('Faturamento recebido', money(s.totalReceived), 'Serviços pagos + pedidos pagos, incluindo frete.')}
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-zinc-800 p-4 text-sm"><p>Valor dos agendamentos<strong className="block text-lg text-amber-300">{money(s.bookedAmount)}</strong><span className="text-zinc-400">Inclui reservas aguardando Pix.</span></p><p>Pedidos aguardando pagamento<strong className="block text-lg">{number(s.pendingOrders)}</strong></p><p>Reservas canceladas ou expiradas<strong className="block text-lg">{number(s.cancelled)}</strong></p></section>
      <section className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6"><h2 className="text-xl font-bold">Movimento por dia</h2><div className="my-4 flex flex-wrap gap-2">{([['visits', 'Acessos'], ['scheduled', 'Agendamentos'], ['productUnits', 'Produtos vendidos']] as const).map(([value,label]) => <button type="button" key={value} aria-pressed={metric === value} onClick={() => setMetric(value)} className={'rounded-lg px-3 py-2 text-sm ' + (metric === value ? 'bg-amber-400 text-black' : 'bg-zinc-800')}>{label}</button>)}</div>
        <div className="grid h-44 items-end gap-1" style={{gridTemplateColumns: 'repeat(' + report.daily.length + ', minmax(0, 1fr))'}}>{report.daily.map(d => <div key={d.day} title={d.day + ': ' + d[metric]} className="flex h-full min-w-0 flex-col justify-end items-center"><div role="img" aria-label={d.day + ': ' + d[metric]} className="w-full rounded-t-sm bg-amber-400" style={{height: d[metric] ? Math.max(4, d[metric] / max * 135) : 2, opacity:d[metric] ? 1 : .2}} /><span className="mt-2 text-[9px] text-zinc-400">{Number(d.day.slice(-2)) % 5 === 0 || d.day.endsWith('01') ? d.day.slice(-2) : ''}</span></div>)}</div>
        <details className="mt-4 text-sm"><summary className="cursor-pointer text-amber-300">Ver números de cada dia</summary><div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">{report.daily.map(d => <p key={d.day} className="rounded-lg bg-zinc-950 p-2">{d.day.split('-').reverse().join('/')} · {number(d[metric])}</p>)}</div></details>
      </section>
      <section className="space-y-3"><h2 className="text-xl font-bold">Cortes e serviços do mês</h2><p className="text-sm text-zinc-400">Preço registrado na reserva, quantidade e total de cada serviço.</p>{report.services.map(r => <article key={r.id + r.name} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"><h3 className="break-words text-lg font-bold text-amber-300">{r.name}</h3><div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm"><p>Agendados<strong className="block text-lg">{number(r.scheduled)}</strong></p><p>Preço<strong className="block">{r.min_price === r.max_price ? money(r.min_price) : money(r.min_price) + ' a ' + money(r.max_price)}</strong></p><p>Total agendado<strong className="block">{money(r.booked_amount)}</strong></p><p>Recebido<strong className="block text-emerald-300">{money(r.received)}</strong></p></div><p className="mt-3 text-xs text-zinc-400">{number(r.completed)} atendidos · {number(r.pending)} aguardando Pix</p></article>)}{!report.services.length && <p className="rounded-xl bg-zinc-900 p-4 text-zinc-400">Nenhum serviço agendado neste mês.</p>}</section>
      <section className="space-y-3"><h2 className="text-xl font-bold">Produtos vendidos no mês</h2>{report.products.map(r => <article key={r.id + r.name} className="flex flex-wrap justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"><strong className="min-w-0 break-words">{r.name}</strong><p>{number(r.quantity)} unidades · <strong className="text-emerald-300">{money(r.amount)}</strong></p></article>)}{!report.products.length && <p className="rounded-xl bg-zinc-900 p-4 text-zinc-400">Nenhuma venda paga de produtos neste mês.</p>}</section>
      <section className="space-y-3"><h2 className="text-xl font-bold">Últimos seis meses</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{report.monthly.map(m => <article key={m.month} className="rounded-xl border border-zinc-800 p-4"><h3 className="capitalize font-semibold text-amber-300">{monthLabel(m.month)}</h3><p className="mt-2 text-sm">{number(m.visits)} acessos</p><p className="text-sm">{number(m.scheduled)} agendamentos</p><p className="text-sm">{number(m.productUnits)} produtos vendidos</p></article>)}</div></section>
      <details className="rounded-xl bg-zinc-900 p-4 text-sm text-zinc-400"><summary className="cursor-pointer font-semibold text-zinc-200">Como os totais são calculados?</summary><div className="mt-3 space-y-2"><p>Os serviços entram no mês da data de atendimento. Os produtos entram no mês da criação do pedido. Pagamentos são mostrados pelo status registrado, e não pela data de liquidação.</p><p>O valor agendado inclui Pix pendente. Receita de serviços soma pagamentos registrados como pagos, inclusive quando o atendimento é cancelado sem estorno. Vendas de produtos consideram pedidos pagos e não cancelados. O total recebido inclui o total dos pedidos, com frete.</p><p>Uma visita é uma sessão de navegação, renovada após 30 minutos sem navegar. Visitantes únicos são estimados por navegador: outra aba pode gerar uma nova visita; outro dispositivo gera outro visitante.</p><p>A contagem começa com esta atualização. {report.trackingStartedAt ? 'Primeiro acesso registrado em ' + new Date(report.trackingStartedAt).toLocaleDateString('pt-BR') + '.' : 'Aguardando o primeiro acesso público.'} Não há visitas retroativas.</p></div></details>
    </>}
  </section>;
};
