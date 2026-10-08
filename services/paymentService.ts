const PAYMENT_ENDPOINT = 'https://oyghjlwujdmgfkopujip.supabase.co/functions/v1/mercado-pago-payment';
import { Order, CustomerInfo } from '../types';
const DRAFT_KEY = 'sb7-store-checkout-request';

export interface PixPaymentResult {
  ok: boolean;
  amount: number;
  orderId: string;
  paymentId: string;
  status: string;
  statusDetail: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
  externalReference: string;
  clientToken?: string;
  order?: Order;
}

export interface PixPaymentStatusResult {
  ok: boolean;
  orderId: string;
  status: string;
  statusDetail: string;
  paid: boolean;
  closed?: boolean;
  order?: Order;
}

async function requestPix(payload: unknown): Promise<PixPaymentResult> {
  const response = await fetch(PAYMENT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) {
    if (data?.restart) localStorage.removeItem(DRAFT_KEY);
    throw new Error(data?.error || 'Não foi possível gerar o Pix agora.');
  }

  return data as PixPaymentResult;
}

export class PaymentService {
  static isGatewayConfigured(): boolean {
    return true;
  }

  static async createStorePix(input: {
    customer: CustomerInfo;
    shippingMethod: string;
    notes?: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<PixPaymentResult> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(input)));
    const fingerprint = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
    let draft: { fingerprint: string; id: string; token: string } | null = null;
    try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { /* Start a fresh request. */ }
    if (draft?.fingerprint !== fingerprint) {
      draft = { fingerprint, id: crypto.randomUUID(), token: crypto.randomUUID() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
    const result = await requestPix({
      action: 'create_pix',
      kind: 'store',
      checkoutId: draft.id, clientToken: draft.token,
      customer: input.customer, shippingMethod: input.shippingMethod, notes: input.notes,
      items: input.items
    });
    return result;
  }

  static async cancelStorePayment(orderId: string, clientToken?: string): Promise<void> {
    const response = await fetch(PAYMENT_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'store', action: 'cancel_order', orderId, clientToken })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || 'Não foi possível cancelar o pedido.');
  }

  static async checkStorePayment(orderId: string, clientToken?: string): Promise<PixPaymentStatusResult> {
    const response = await fetch(PAYMENT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'check_status',
        kind: 'store',
        orderId, clientToken
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || 'Não foi possível confirmar o pagamento agora.');
    }

    return data as PixPaymentStatusResult;
  }
}
