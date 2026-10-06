import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const base = Deno.env.get('SUPABASE_URL')!;
const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const mpToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json' };
const respond = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: cors });
const dbHeaders = { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };

async function db(path: string, options: RequestInit = {}) {
  const response = await fetch(`${base}/rest/v1/${path}`, { ...options, headers: { ...dbHeaders, ...options.headers } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || `Banco de dados: ${response.status}`);
  return data;
}
async function mpOrder(id: string) {
  if (!mpToken) throw new Error('Pagamento indisponível.');
  const response = await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${mpToken}` } });
  if (!response.ok) throw new Error('Não foi possível consultar o pagamento.');
  return response.json();
}
const paid = (order: any) => order?.status === 'processed' && order?.status_detail === 'accredited';
const text = (value: unknown, max = 120) => String(value ?? '').trim().slice(0, max);
const professionals = [{ id: 'ray-black7', name: 'Ray Silva (Ray Black7)' }];
type Window = { start: string; end: string; closed?: boolean };
type Closure = { date: string; professionalId: string; start?: string; end?: string };
type BookingSettings = { weekly: Record<string, Window[]>; closures: Closure[] };
const timeNumber = (v: string) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3));
const validTime = (v: unknown) => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
async function loadSettings(): Promise<BookingSettings> {
  const rows = await db('booking_settings?id=eq.1&select=weekly,closures');
  if (!rows?.[0]) throw new Error('Agenda indisponível.');
  return rows[0];
}
function weekday(date: string) { return new Date(`${date}T12:00:00-03:00`).getUTCDay(); }
function intervals(settings: BookingSettings, date: string, professional: string): Window[] {
  const day = weekday(date);
  if (!Number.isInteger(day)) return [];
  const windows = (settings.weekly[String(day)] || []).filter(w => !w.closed);
  const exceptions = settings.closures.filter(c => c.date === date && (c.professionalId === 'all' || c.professionalId === professional));
  if (exceptions.some(c => !c.start || !c.end)) return [];
  // Partial closures are checked against each suggested time and on reservation.
  const merged: Window[] = [];
  for (const window of [...windows].sort((a, b) => timeNumber(a.start) - timeNumber(b.start))) {
    const last = merged[merged.length - 1];
    if (last && last.end === window.start) last.end = window.end;
    else merged.push({ start: window.start, end: window.end });
  }
  return merged;
}
function isOpen(settings: BookingSettings, date: string, hour: string, duration: number, professional: string) {
  const begin = timeNumber(hour), end = begin + duration;
  if (!intervals(settings, date, professional).some(w => begin >= timeNumber(w.start) && end <= timeNumber(w.end))) return false;
  return !settings.closures.some(c => c.date === date && (c.professionalId === 'all' || c.professionalId === professional) && (!c.start || !c.end || begin < timeNumber(c.end) && end > timeNumber(c.start)));
}
function validateSettings(input: any): BookingSettings {
  const weekly: Record<string, Window[]> = {};
  for (let day = 0; day < 7; day++) {
    const windows = input?.weekly?.[String(day)];
    if (!Array.isArray(windows) || windows.length > 24) throw new Error('Revise os horários da semana.');
    weekly[String(day)] = windows.map((w: any) => {
      if (!validTime(w?.start) || !validTime(w?.end) || timeNumber(w.start) >= timeNumber(w.end)) throw new Error('Há um intervalo inválido na semana.');
      if (w.closed !== undefined && typeof w.closed !== 'boolean') throw new Error('Estado do dia inválido.');
      return { start: w.start, end: w.end, ...(w.closed !== undefined ? { closed: w.closed } : {}) };
    }).sort((a, b) => timeNumber(a.start) - timeNumber(b.start));
    if (weekly[String(day)].some((w, i) => i > 0 && timeNumber(w.start) < timeNumber(weekly[String(day)][i - 1].end))) throw new Error('Os intervalos de um dia não podem se sobrepor.');
  }
  if (!Array.isArray(input?.closures) || input.closures.length > 100) throw new Error('Lista de bloqueios inválida.');
  const closures = input.closures.map((c: any) => {
    const date = text(c?.date, 10), professionalId = text(c?.professionalId, 60);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(new Date(`${date}T12:00:00-03:00`).getTime()) || !['all', 'barbeiro-executor', ...professionals.map(p => p.id)].includes(professionalId)) throw new Error('Data ou profissional do bloqueio inválido.');
    if (!c.start && !c.end) return { date, professionalId };
    if (!validTime(c.start) || !validTime(c.end) || timeNumber(c.start) >= timeNumber(c.end)) throw new Error('Intervalo de bloqueio inválido.');
    return { date, professionalId, start: c.start, end: c.end };
  });
  return { weekly, closures };
}

async function reconcile(row: any) {
  if (row.status !== 'pending_payment') return row;
  if (row.mp_order_id) {
    try {
      const order = await mpOrder(row.mp_order_id);
      if (paid(order)) {
        const changed = await db(`appointments?id=eq.${row.id}&status=eq.pending_payment`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'confirmed', payment_status: 'paid', updated_at: new Date().toISOString() }) });
        return changed?.[0] || row;
      }
      if (!['cancelled', 'failed', 'expired'].includes(String(order?.status)) && !['cancelled', 'expired'].includes(String(order?.status_detail))) return row;
    } catch { /* Leave the reservation pending when provider status is unknown. */ }
  }
  if (new Date(row.hold_expires_at).getTime() < Date.now()) {
    const changed = await db(`appointments?id=eq.${row.id}&status=eq.pending_payment`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'expired', updated_at: new Date().toISOString() }) });
    return changed?.[0] || row;
  }
  return row;
}

async function serviceCatalog() {
  const rows = await db('site_data?key=eq.services&select=value');
  return Array.isArray(rows?.[0]?.value) ? rows[0].value : [];
}

function slot(date: string, hour: string, duration: number, professional: string, settings: BookingSettings) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(hour)) throw new Error('Data ou horário inválido.');
  if (!isOpen(settings, date, hour, duration, professional)) throw new Error('Horário indisponível na agenda.');
  const start = new Date(`${date}T${hour}:00-03:00`);
  if (!Number.isFinite(start.getTime()) || start.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) !== date || start.getTime() < Date.now() + 30 * 60000 || start.getTime() > Date.now() + 60 * 86400000) throw new Error('Escolha uma data válida entre 30 minutos e 60 dias no futuro.');
  return { start_at: start.toISOString(), end_at: new Date(start.getTime() + duration * 60000).toISOString() };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { headers: cors });
  if (req.method !== 'POST') return respond({ error: 'Método inválido.' }, 405);
  try {
    const body = await req.json();
    const action = text(body.action, 30);
    if (action === 'track_access') {
      if (req.headers.get('origin') !== 'https://daniel-soliz.github.io') return respond({ error: 'Origem inválida.' }, 403);
      const sessionId = text(body.sessionId, 40), visitorId = text(body.visitorId, 40);
      const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
      if (!uuid.test(sessionId) || !uuid.test(visitorId)) return respond({ error: 'Acesso inválido.' }, 400);
      await db('site_visits?on_conflict=session_id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify({ session_id: sessionId, visitor_id: visitorId }) });
      return respond({ success: true });
    }
    if (action === 'availability') {
      const date = text(body.date, 10), professional = text(body.professionalId, 60);
      if (!professionals.some(p => p.id === professional) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return respond({ error: 'Seleção inválida.' }, 400);
      const settings = await loadSettings();
      const rows = await db(`appointments?professional_id=eq.${professional}&start_at=gte.${date}T00:00:00-03:00&start_at=lt.${date}T23:59:59-03:00&status=in.(pending_payment,confirmed,completed)&select=id,start_at,end_at,status,hold_expires_at,mp_order_id`);
      const active = await Promise.all(rows.map(reconcile));
      return respond({ busy: active.filter((r: any) => ['pending_payment', 'confirmed', 'completed'].includes(r.status)).map((r: any) => ({ start: r.start_at, end: r.end_at })), intervals: intervals(settings, date, professional), closures: settings.closures.filter(c => c.date === date && (c.professionalId === 'all' || c.professionalId === professional)) });
    }
    if (action === 'reserve') {
      if (!mpToken) return respond({ error: 'Pagamento Pix ainda não configurado.' }, 503);
      const service = (await serviceCatalog()).find((s: any) => s.id === body.serviceId && s.status !== 'inactive');
      const professional = professionals.find(p => p.id === body.professionalId);
      const amount = Number(service?.priceNumber);
      if (!service || !professional || !(amount > 0) || amount > 5000) return respond({ error: 'Serviço ou profissional indisponível.' }, 400);
      const duration = 60;
      const customer_name = text(body.name), customer_email = text(body.email, 160).toLowerCase(), customer_phone = text(body.phone, 20).replace(/\D/g, '');
      if (customer_name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer_email) || customer_phone.length < 10 || customer_phone.length > 13) return respond({ error: 'Informe nome, e-mail e telefone válidos.' }, 400);
      const times = slot(text(body.date, 10), text(body.time, 5), duration, professional.id, await loadSettings());
      const newRows = await db('appointments', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...times, service_id: service.id, service_name: service.name, professional_id: professional.id, professional_name: professional.name, customer_name, customer_email, customer_phone, amount_cents: Math.round(amount * 100), hold_expires_at: new Date(Date.now() + 35 * 60000).toISOString() }) });
      const row = newRows[0];
      const mpResponse = await fetch('https://api.mercadopago.com/v1/orders', { method: 'POST', headers: { Authorization: `Bearer ${mpToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': row.id }, body: JSON.stringify({ type: 'online', external_reference: row.payment_reference, total_amount: amount.toFixed(2), processing_mode: 'automatic', payer: { email: customer_email }, transactions: { payments: [{ amount: amount.toFixed(2), payment_method: { id: 'pix', type: 'bank_transfer' }, expiration_time: 'PT30M' }] } }) });
      const order = await mpResponse.json().catch(() => ({}));
      if (!mpResponse.ok || !order.id) {
        await db(`appointments?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled', payment_status: 'failed' }) });
        return respond({ error: 'Não foi possível gerar o Pix. Tente novamente.' }, 502);
      }
      await db(`appointments?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ mp_order_id: String(order.id) }) });
      const method = order.transactions?.payments?.[0]?.payment_method || {};
      return respond({ reference: row.payment_reference, amount, qrCode: method.qr_code, qrCodeBase64: method.qr_code_base64, ticketUrl: method.ticket_url, status: 'pending_payment' });
    }
    if (action === 'status') {
      const reference = text(body.reference, 64);
      if (!/^[a-f0-9]{32}$/.test(reference)) return respond({ error: 'Código inválido.' }, 400);
      const rows = await db(`appointments?payment_reference=eq.${reference}&select=*`);
      if (!rows.length) return respond({ error: 'Agendamento não encontrado.' }, 404);
      const row = await reconcile(rows[0]);
      return respond({ status: row.status, paymentStatus: row.payment_status, service: row.service_name, professional: row.professional_name, start: row.start_at });
    }
    if (action === 'admin_list' || action === 'admin_update' || action === 'admin_settings' || action === 'admin_save_settings' || action === 'admin_report') {
      const token = text(body.token, 1000);
      const auth = await fetch(`${base}/functions/v1/admin-security`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify', token }) });
      if (!auth.ok || !(await auth.json()).success) return respond({ error: 'Acesso negado.' }, 401);
      if (action === 'admin_report') {
        const month = text(body.month, 7);
        if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) return respond({ error: 'Escolha um mês válido.' }, 400);
        return respond({ report: await db('rpc/dashboard_report', { method: 'POST', body: JSON.stringify({ p_month: month + '-01' }) }) });
      }
      if (action === 'admin_settings') return respond({ settings: await loadSettings() });
      if (action === 'admin_save_settings') {
        const settings = validateSettings(body.settings);
        const rows = await db('booking_settings?id=eq.1', { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...settings, updated_at: new Date().toISOString() }) });
        return respond({ settings: rows?.[0] || settings });
      }
      if (action === 'admin_list') {
        const rows = await db('appointments?select=*&order=start_at.desc&limit=300');
        return respond({ appointments: await Promise.all(rows.map(reconcile)) });
      }
      const id = text(body.id, 40), next = text(body.status, 30);
      if (!/^[a-f0-9-]{36}$/.test(id) || !['completed', 'cancelled'].includes(next)) return respond({ error: 'Alteração inválida.' }, 400);
      const rows = await db(`appointments?id=eq.${id}&status=eq.confirmed`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: next, updated_at: new Date().toISOString() }) });
      return rows.length ? respond({ appointment: rows[0] }) : respond({ error: 'Só agendamentos confirmados podem ser concluídos ou cancelados.' }, 409);
    }
    return respond({ error: 'Ação inválida.' }, 400);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Falha temporária.';
    return respond({ error: message.includes('appointments_no_overlap') || message.includes('conflicting key value') ? 'Este horário acabou de ser reservado. Escolha outro.' : message }, message.includes('overlap') ? 409 : 400);
  }
});
