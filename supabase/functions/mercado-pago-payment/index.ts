import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MP_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function parseMoney(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const cleaned = value.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanText(value: unknown, max = 160) {
  return String(value ?? "").trim().slice(0, max);
}

async function loadProducts() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/site_data?key=eq.products&select=value&limit=1`,
    {
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) throw new Error("Falha ao validar o catálogo.");
  const rows = await response.json();
  return Array.isArray(rows?.[0]?.value) ? rows[0].value : [];
}

async function getMercadoPagoOrder(orderId: string) {
  const response = await fetch(
    `https://api.mercadopago.com/v1/orders/${encodeURIComponent(orderId)}`,
    {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        Accept: "application/json",
      },
    },
  );

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      result,
    };
  }

  return {
    ok: true,
    status: response.status,
    result,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!MP_ACCESS_TOKEN) {
    return json({ ok: false, configured: false, error: "Mercado Pago não configurado." }, 503);
  }

  if (req.method === "GET") {
    return json({ ok: true, configured: true, mode: "store-pix" });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "Método não permitido." }, 405);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "JSON inválido." }, 400);
  }

  if (body?.kind !== "store") {
    return json({ ok: false, error: "Apenas pagamentos da loja estão habilitados." }, 400);
  }

  if (body?.action === "check_status") {
    const orderId = cleanText(body?.orderId, 80);
    if (!/^ORD[A-Z0-9]+$/i.test(orderId)) {
      return json({ ok: false, error: "Order ID inválido." }, 400);
    }

    const mp = await getMercadoPagoOrder(orderId);
    if (!mp.ok) {
      return json({
        ok: false,
        mercadoPagoStatus: mp.status,
        error: mp.result?.message || mp.result?.error || "Não foi possível consultar o pagamento.",
      }, 502);
    }

    const status = String(mp.result?.status || "");
    const statusDetail = String(mp.result?.status_detail || "");
    const paid = status === "processed" && statusDetail === "accredited";

    return json({
      ok: true,
      orderId,
      status,
      statusDetail,
      paid,
    });
  }

  if (body?.action !== "create_pix") {
    return json({ ok: false, error: "Ação inválida." }, 400);
  }

  const customerName = cleanText(body?.payer?.name, 120);
  const customerEmail = cleanText(body?.payer?.email, 160).toLowerCase();

  if (!customerName || !customerEmail || !customerEmail.includes("@")) {
    return json({ ok: false, error: "Nome e e-mail do pagador são obrigatórios." }, 400);
  }

  // Use the actual buyer in production; never substitute a sandbox account.
  const payerEmail = customerEmail;

  const requestedItems = Array.isArray(body?.items) ? body.items : [];
  if (!requestedItems.length || requestedItems.length > 30) {
    return json({ ok: false, error: "Carrinho inválido." }, 400);
  }

  let amount = 0;
  const names: string[] = [];
  let externalReference = cleanText(body?.externalReference, 80).replace(/[^a-zA-Z0-9_-]/g, "");

  try {
    const products = await loadProducts();

    for (const requested of requestedItems) {
      const productId = cleanText(requested?.productId, 120);
      const quantity = Math.max(1, Math.min(20, Math.floor(Number(requested?.quantity) || 1)));
      const product = products.find((item: any) => item?.id === productId && item?.status !== "inactive");

      if (!product) {
        return json({ ok: false, error: "Um produto do carrinho não está disponível." }, 400);
      }

      const regular = parseMoney(product?.price);
      const sale = parseMoney(product?.salePrice);
      const unitPrice = sale > 0 && sale < regular ? sale : regular;

      if (!(unitPrice > 0)) {
        return json({
          ok: false,
          error: `O produto "${cleanText(product?.name, 80)}" está sob consulta e não pode ser pago online.`,
        }, 400);
      }

      amount += unitPrice * quantity;
      names.push(`${quantity}x ${cleanText(product?.name, 60)}`);
    }
  } catch (error) {
    return json({
      ok: false,
      error: error instanceof Error ? error.message : "Falha ao validar o carrinho.",
    }, 500);
  }

  amount = Math.round(amount * 100) / 100;
  if (!(amount > 0) || amount > 50000) {
    return json({ ok: false, error: "Valor da cobrança inválido." }, 400);
  }

  externalReference ||= `sb7_store_${Date.now()}`;

  const mpBody = {
    type: "online",
    external_reference: externalReference,
    total_amount: amount.toFixed(2),
    processing_mode: "automatic",
    payer: {
      email: payerEmail,
    },
    transactions: {
      payments: [
        {
          amount: amount.toFixed(2),
          payment_method: {
            id: "pix",
            type: "bank_transfer",
          },
        },
      ],
    },
  };

  const response = await fetch("https://api.mercadopago.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(mpBody),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const upstreamDetail =
      result?.message ||
      result?.error ||
      result?.code ||
      result?.errors?.[0]?.message ||
      result?.errors?.[0]?.detail ||
      result?.cause?.[0]?.description ||
      result?.status_detail ||
      "Falha ao criar cobrança Pix.";

    return json({
      ok: false,
      configured: true,
      mercadoPagoStatus: response.status,
      error: String(upstreamDetail),
      details: result?.errors || result?.cause || result?.status_detail || undefined,
    }, 502);
  }

  const payment = result?.transactions?.payments?.[0] || {};
  const method = payment?.payment_method || {};

  return json({
    ok: true,
    configured: true,
    kind: "store",
    amount,
    orderId: result?.id,
    externalReference: result?.external_reference || externalReference,
    status: result?.status,
    statusDetail: result?.status_detail,
    paymentId: payment?.id,
    paymentStatus: payment?.status,
    paymentStatusDetail: payment?.status_detail,
    qrCode: method?.qr_code || "",
    qrCodeBase64: method?.qr_code_base64 || "",
    ticketUrl: method?.ticket_url || "",
  });
});