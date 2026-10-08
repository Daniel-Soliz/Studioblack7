import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const base = Deno.env.get('SUPABASE_URL')!;
const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const mpToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Content-Type': 'application/json' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: cors });
const text = (value: unknown, max = 160) => String(value ?? '').trim().slice(0, max);
const uuid = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
const dbHeaders = { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };
async function db(path: string, options: RequestInit = {}) {
  const response = await fetch(`${base}/rest/v1/${path}`, { ...options, headers: { ...dbHeaders, ...options.headers }, signal: AbortSignal.timeout(15000) });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || 'Não foi possível salvar no banco.');
  return data;
}
async function command(action: string, id: string, data: unknown = {}) {
  return db('rpc/store_checkout_command', { method: 'POST', body: JSON.stringify({ p_action: action, p_id: id, p_data: data }) });
}
async function admin(req: Request, body: any) {
  const token = text(body?.token || req.headers.get('authorization')?.replace(/^Bearer /i, ''), 2000);
  const response = await fetch(`${base}/functions/v1/admin-security`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify', token }), signal: AbortSignal.timeout(10000) });
  return response.ok && (await response.json()).success === true;
}
async function mpOrder(id: string) {
  if (!mpToken) throw new Error('Mercado Pago indisponível.');
  const response = await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${mpToken}` }, signal: AbortSignal.timeout(12000) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('Não foi possível conferir o Pix no Mercado Pago. Tente novamente.');
  return data;
}
const isPaid = (order: any) => order?.status === 'processed' && order?.status_detail === 'accredited';
const isClosed = (order: any) => ['expired','cancelled','canceled','failed'].includes(order?.status);
async function reconcile(record: any, provider?: any) {
  if (!record || record.state !== 'pending' || !record.mp_order_id) return record;
  const order = provider || await mpOrder(record.mp_order_id);
  if (isPaid(order)) {
    if (Math.round(Number(order.total_paid_amount ?? order.total_amount) * 100) !== Math.round(Number(record.order_data.total) * 100)) throw new Error('Valor do pagamento exige conferência do Studio.');
    return command('paid', record.id);
  }
  if (isClosed(order)) return command('close', record.id);
  await db(`store_checkouts?id=eq.${record.id}`, { method: 'PATCH', body: JSON.stringify({ updated_at: new Date().toISOString() }) });
  return record;
}
async function cancelProvider(id: string) {
  const latest = await mpOrder(id);
  if (isPaid(latest) || latest.status === 'processed') throw new Error('Este pedido já foi pago. Fale com o Studio para solicitar alterações.');
  if (isClosed(latest)) return;
  const response = await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${mpToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': `cancel-${id}` }, signal: AbortSignal.timeout(12000) });
  if (!response.ok && !isClosed(await mpOrder(id))) throw new Error('Não foi possível cancelar o Pix. Nenhum pedido foi apagado.');
}
async function legacyOrders() {
  const rows = await db('site_data?key=eq.orders&select=value');
  return Array.isArray(rows?.[0]?.value) ? rows[0].value : [];
}
async function legacyReconcile(order: any, provider: any) {
  if (order.paymentStatus === 'paid') return;
  if (isPaid(provider)) {
    if (Math.round(Number(provider.total_paid_amount ?? provider.total_amount)*100) !== Math.round(Number(order.total)*100)) return;
    // Existing records use the same private, per-record transaction.
    await db('rpc/store_admin_order', { method: 'POST', body: JSON.stringify({ p_action: 'provider_paid', p_id: order.id, p_data: {} }) });
  }
}
function sanitizeSettings(value: any) {
  const result = { ...value };
  for (const key of ['adminPasswordHash','cloudSyncKey','cloudSyncUrl','adminEmail']) delete result[key];
  return result;
}
const allowedKeys = ['products','categories','services','gallery','content','settings','activities'];

async function recoverCreating(record: any) {
  const amount = Number(record.order_data.total);
  const response = await fetch('https://api.mercadopago.com/v1/orders', { method: 'POST', headers: { Authorization: `Bearer ${mpToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': record.id }, body: JSON.stringify({ type: 'online', external_reference: record.id, total_amount: amount.toFixed(2), processing_mode: 'automatic', payer: { email: record.order_data.customer.email }, transactions: { payments: [{ amount: amount.toFixed(2), expiration_time: 'PT30M', payment_method: { id: 'pix', type: 'bank_transfer' } }] } }), signal: AbortSignal.timeout(20000) });
  const provider = await response.json().catch(() => ({}));
  if (!response.ok || !provider.id) {
    if (response.status >= 400 && response.status < 500 && ![409,429].includes(response.status)) await command('close',record.id);
    return;
  }
  const payment = provider.transactions?.payments?.[0] || {}, method = payment.payment_method || {};
  const pix = { ok: true, amount, orderId: provider.id, paymentId: payment.id, externalReference: record.id, status: provider.status, statusDetail: provider.status_detail, qrCode: method.qr_code || '', qrCodeBase64: method.qr_code_base64 || '', ticketUrl: method.ticket_url || '', clientToken: record.client_token };
  const attached = await command('attach',record.id,{ mpOrderId: provider.id,pix });
  await reconcile(attached, provider);
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('', { headers: cors });
  if (req.method === 'GET') return json({ ok: true, configured: !!mpToken, mode: 'store-pix' });
  if (req.method !== 'POST') return json({ ok: false, error: 'Método inválido.' }, 405);
  try {
    const url = new URL(req.url);
    if (url.searchParams.get('action') === 'upload') {
      if (!await admin(req, {})) return json({ ok: false, error: 'Acesso administrativo necessário.' }, 401);
      const type = req.headers.get('content-type') || '';
      if (!['image/jpeg','image/png','image/webp'].includes(type)) return json({ ok: false, error: 'Use uma imagem JPG, PNG ou WebP.' }, 400);
      const blob = await req.blob();
      if (!blob.size || blob.size > 5 * 1024 * 1024) return json({ ok: false, error: 'A imagem precisa ter até 5 MB.' }, 400);
      const folder = text(url.searchParams.get('folder'), 40).replace(/[^a-z0-9_-]/gi,'') || 'site';
      const name = `${folder}/${crypto.randomUUID()}.${type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg'}`;
      const response = await fetch(`${base}/storage/v1/object/site-images/${name}`, { method: 'POST', headers: { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': type, 'cache-control': '31536000' }, body: blob });
      if (!response.ok) throw new Error('Não foi possível salvar a imagem.');
      return json({ ok: true, url: `${base}/storage/v1/object/public/site-images/${name}` });
    }
    const body = await req.json();
    const action = text(body.action, 40);
    if (action === 'sync_pending') {
      const key = await db('rpc/sb7_payment_sync_key',{ method:'POST',body:'{}' });
      if (!key || req.headers.get('authorization') !== `Bearer ${key}`) return json({ ok:false,error:'Acesso negado.' },401);
      const pending = await db('store_checkouts?state=eq.pending&select=*&order=updated_at.asc&limit=20');
      const creating = await db(`store_checkouts?state=eq.creating&created_at=lt.${encodeURIComponent(new Date(Date.now()-60000).toISOString())}&select=*&order=created_at.asc&limit=5`);
      const legacy = (await legacyOrders()).filter((o:any) => o.paymentStatus !== 'paid' && o.status !== 'cancelled' && o.notes?.match(/Mercado Pago Order: (ORD[A-Z0-9]+)/i)).filter((o:any) => !String(o.id).match(/^ord-[a-f0-9-]{36}$/i)).slice(0,10);
      const results = await Promise.allSettled([
        ...(pending || []).map((r:any) => reconcile(r)),
        ...(creating || []).map((r:any) => recoverCreating(r)),
        ...legacy.map(async(o:any) => {
          const provider=await mpOrder(o.notes.match(/Mercado Pago Order: (ORD[A-Z0-9]+)/i)[1]);
          if (isClosed(provider)) await db('rpc/store_admin_order',{method:'POST',body:JSON.stringify({p_action:'legacy_close',p_id:o.id,p_data:{}})});
          else await legacyReconcile(o,provider);
        })
      ]);
      const booking = await fetch(`${base}/functions/v1/appointments`,{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({action:'provider_sync_all'}),signal:AbortSignal.timeout(25000)});
      return json({ok:true,checked:results.length,failed:results.filter(r=>r.status==='rejected').length,bookings:booking.ok});
    }
    if (action.startsWith('admin_')) {
      if (!await admin(req, body)) return json({ ok: false, error: 'Sua sessão expirou. Entre novamente no painel.' }, 401);
      if (action === 'admin_load') {
        const pending = await db(`store_checkouts?state=eq.pending&updated_at=lt.${encodeURIComponent(new Date(Date.now()-5000).toISOString())}&select=*&order=created_at.asc&limit=20`);
        await Promise.allSettled((pending || []).map((record: any) => reconcile(record)));
        const rows = await db('site_data?select=key,value,updated_at&order=key.asc');
        return json({ ok: true, rows: rows.map((row: any) => row.key === 'settings' ? { ...row, value: sanitizeSettings(row.value) } : row) });
      }
      if (action === 'admin_save') {
        if (!allowedKeys.includes(body.key)) return json({ ok: false, error: 'Alteração inválida.' }, 400);
        let value = body.value;
        if (['products','categories','services','gallery','activities'].includes(body.key) && !Array.isArray(value)) return json({ ok: false, error: 'Lista inválida.' }, 400);
        if (body.key === 'products' && value.some((p: any) => !p.id || !Number.isInteger(p.stock) || p.stock < 0 || !Number.isFinite(p.price) || p.price < 0)) return json({ ok: false, error: 'Revise preços e estoque dos produtos.' }, 400);
        if (body.key === 'settings') value = sanitizeSettings(value);
        const updatedAt = await db('rpc/site_data_save', { method: 'POST', body: JSON.stringify({ p_key: body.key, p_value: value, p_expected: body.expectedUpdatedAt || null }) });
        return json({ ok: true, updatedAt });
      }
      if (action === 'admin_order') {
        const id = text(body.orderId, 100), operation = text(body.operation, 20);
        if (!['status','save','delete'].includes(operation)) return json({ ok: false, error: 'Operação inválida.' }, 400);
        const records = await db(`store_checkouts?order_data->>id=eq.${encodeURIComponent(id)}&select=*`);
        if (operation === 'delete') {
          const existing = records?.[0]?.order_data || (await legacyOrders()).find((o: any) => o.id === id);
          if (existing?.paymentStatus === 'paid') return json({ ok: false, error: 'Pedido pago faz parte do histórico financeiro. Altere o status do atendimento; para estorno, confira primeiro o Mercado Pago.' }, 409);
        }
        if (operation === 'delete' || operation === 'status' && body.data?.status === 'cancelled') {
          if (records?.[0] && ['creating','pending'].includes(records[0].state)) {
            if (records[0].mp_order_id) await cancelProvider(records[0].mp_order_id);
            await command('close', records[0].id);
          } else if (!records?.length) {
            const existing = (await legacyOrders()).find((o: any) => o.id === id);
            const mpId = existing?.notes?.match(/Mercado Pago Order: (ORD[A-Z0-9]+)/i)?.[1];
            if (mpId && existing.paymentStatus !== 'paid') {
              await cancelProvider(mpId);
              await db('rpc/store_admin_order', { method: 'POST', body: JSON.stringify({ p_action: 'legacy_close', p_id: id, p_data: {} }) });
            }
          }
          if (operation === 'status' && records?.[0]?.state !== 'paid') return json({ ok: true, order: null });
        }
        if (operation === 'status' && !['pending','confirmed','processing','preparing','shipped','completed','cancelled'].includes(body.data?.status)) return json({ ok: false, error: 'Status inválido.' }, 400);
        const data = operation === 'status' ? { status: body.data.status, ...(body.data.paymentStatus ? { paymentStatus: body.data.paymentStatus } : {}) } : body.data;
        if (operation === 'save' && (!data?.customer?.name?.trim() || !data?.customer?.phone?.trim())) return json({ ok: false, error: 'Informe nome e telefone do cliente.' }, 400);
        const order = await db('rpc/store_admin_order', { method: 'POST', body: JSON.stringify({ p_action: operation, p_id: id, p_data: data || {} }) });
        return json({ ok: true, order });
      }
      return json({ ok: false, error: 'Ação inválida.' }, 400);
    }
    // Notifications are only a trigger. Never trust their status/amount: fetch the
    // resource with our production credentials before changing anything.
    if (action === 'provider_notification' || body.type === 'order') {
      const id = text(body.data?.id || url.searchParams.get('data.id'), 80);
      if (!/^ORD[A-Z0-9]+$/i.test(id)) return json({ ok: true });
      const records = await db(`store_checkouts?mp_order_id=eq.${encodeURIComponent(id)}&select=*`);
      if (records?.[0]) await reconcile(records[0]);
      else {
        const response = await fetch(`${base}/functions/v1/appointments`, { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'provider_sync', orderId: id }), signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('Não foi possível atualizar o agendamento.');
      }
      return json({ ok: true });
    }
    if (body.kind !== 'store') return json({ ok: false, error: 'Ação inválida.' }, 400);
    if (!mpToken) return json({ ok: false, error: 'Mercado Pago indisponível.' }, 503);
    if (action === 'check_status' || action === 'cancel_order') {
      const id = text(body.orderId, 80);
      if (!/^ORD[A-Z0-9]+$/i.test(id)) return json({ ok: false, error: 'Pedido inválido.' }, 400);
      const records = await db(`store_checkouts?mp_order_id=eq.${encodeURIComponent(id)}&select=*`);
      const record = records?.[0];
      if (record && record.client_token !== body.clientToken) return json({ ok: false, error: 'Pedido inválido.' }, 404);
      const legacy = record ? null : (await legacyOrders()).find((o: any) => String(o.notes || '').includes(`Mercado Pago Order: ${id}`));
      if (!record && !legacy) return json({ ok: false, error: 'Pedido não encontrado.' }, 404);
      if (record?.state === 'closed') return json({ ok: true, orderId: id, closed: true, paid: false, status: 'cancelled', statusDetail: '' });
      const provider = await mpOrder(id);
      if (action === 'cancel_order') {
        if (isPaid(provider) || provider.status === 'processed') {
          if (record) await reconcile(record, provider); else await legacyReconcile(legacy, provider);
          return json({ ok: false, error: 'O pagamento já foi aprovado. Fale com o Studio para solicitar alterações.' }, 409);
        }
        await cancelProvider(id);
        if (record) await command('close', record.id);
        else await db('rpc/store_admin_order', { method: 'POST', body: JSON.stringify({ p_action: 'legacy_close', p_id: legacy.id, p_data: {} }) });
        return json({ ok: true, cancelled: true });
      }
      const latest = record ? await reconcile(record, provider) : null;
      if (legacy) {
        await legacyReconcile(legacy, provider);
        if (isClosed(provider) && legacy.paymentStatus !== 'paid') await db('rpc/store_admin_order', { method: 'POST', body: JSON.stringify({ p_action: 'legacy_close', p_id: legacy.id, p_data: {} }) });
      }
      return json({ ok: true, orderId: id, paid: latest?.state === 'paid' || !!legacy && isPaid(provider), closed: latest?.state === 'closed' || isClosed(provider), status: provider.status, statusDetail: provider.status_detail, ...(latest ? { order: latest.order_data } : {}) });
    }
    if (action !== 'create_pix') return json({ ok: false, error: 'Ação inválida.' }, 400);
    if (!uuid(body.checkoutId) || !uuid(body.clientToken)) return json({ ok: false, error: 'Atualize a página para iniciar sua compra.' }, 400);
    const customer = body.customer;
    if (!customer || text(customer.name).length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text(customer.email)) || !/^\d{10,13}$/.test(text(customer.phone).replace(/\D/g,''))) return json({ ok: false, error: 'Informe nome, e-mail e telefone válidos.' }, 400);
    if (body.shippingMethod !== 'Retirada no Studio Black7 (Gratuita)' && (!text(customer.address?.street) || !text(customer.address?.number) || !/^\d{8}$/.test(text(customer.address?.postalCode).replace(/\D/g,'')))) return json({ ok: false, error: 'Preencha endereço, número e CEP para entrega.' }, 400);
    const cleanCustomer = { name: text(customer.name,120), email: text(customer.email,160).toLowerCase(), phone: text(customer.phone,20), address: Object.fromEntries(['street','number','complement','neighborhood','city','state','postalCode'].map(key => [key,text(customer.address?.[key],160)])) };
    let record = await command('reserve', body.checkoutId, { items: body.items, customer: cleanCustomer, shippingMethod: body.shippingMethod, notes: text(body.notes,500), clientToken: body.clientToken });
    if (record.client_token !== body.clientToken) return json({ ok: false, error: 'Pedido inválido.' }, 404);
    if (record.state === 'closed') return json({ ok: false, restart: true, error: 'Este pedido encerrou. Você pode tentar gerar um novo Pix.' }, 409);
      if (record.pix) return json({ ...record.pix, order: record.order_data, clientToken: record.client_token });
    const amount = Number(record.order_data.total);
    let response: Response;
    try {
      response = await fetch('https://api.mercadopago.com/v1/orders', { method: 'POST', headers: { Authorization: `Bearer ${mpToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': record.id }, body: JSON.stringify({ type: 'online', external_reference: record.id, total_amount: amount.toFixed(2), processing_mode: 'automatic', payer: { email: record.order_data.customer.email }, transactions: { payments: [{ amount: amount.toFixed(2), expiration_time: 'PT30M', payment_method: { id: 'pix', type: 'bank_transfer' } }] } }), signal: AbortSignal.timeout(20000) });
    } catch { return json({ ok: false, error: 'O Mercado Pago demorou a responder. Tente novamente: vamos recuperar a mesma cobrança, sem duplicar.' }, 502); }
    const provider = await response.json().catch(() => ({}));
    if (!response.ok || !provider.id) {
      if (response.status >= 400 && response.status < 500 && response.status !== 409 && response.status !== 429) await command('close', record.id);
      return json({ ok: false, restart: response.status >= 400 && response.status < 500 && ![409,429].includes(response.status), error: 'Não foi possível gerar o Pix. Confira seus dados e tente novamente.' }, 502);
    }
    const payment = provider.transactions?.payments?.[0] || {}, method = payment.payment_method || {};
    const pix = { ok: true, amount, orderId: provider.id, paymentId: payment.id, externalReference: record.id, status: provider.status, statusDetail: provider.status_detail, qrCode: method.qr_code || '', qrCodeBase64: method.qr_code_base64 || '', ticketUrl: method.ticket_url || '', clientToken: record.client_token };
    record = await command('attach', record.id, { mpOrderId: provider.id, pix });
    return json({ ...pix, order: record.order_data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.';
    return json({ ok: false, error: message }, /mudaram em outro/.test(message) ? 409 : 400);
  }
});
