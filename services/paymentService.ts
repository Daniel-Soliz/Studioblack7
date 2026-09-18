const PAYMENT_ENDPOINT = 'https://oyghjlwujdmgfkopujip.supabase.co/functions/v1/mercado-pago-payment';

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
}

async function requestPix(payload: unknown): Promise<PixPaymentResult> {
  const response = await fetch(PAYMENT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || 'Não foi possível gerar o Pix agora.');
  }

  return data as PixPaymentResult;
}

export class PaymentService {
  static isGatewayConfigured(): boolean {
    return true;
  }

  static async createStorePix(input: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<PixPaymentResult> {
    return requestPix({
      action: 'create_pix',
      kind: 'store',
      externalReference: input.orderId,
      payer: { name: input.customerName, email: input.customerEmail },
      items: input.items
    });
  }
}
