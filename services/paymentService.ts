export interface PaymentPreference {
  orderId: string;
  total: number;
  customerName: string;
  customerEmail: string;
}

export interface PaymentResult {
  success: boolean;
  status: 'pending' | 'configured_later';
  message: string;
  providerNotice: string;
}

/**
 * PaymentService handles checkout gateway abstraction.
 * Sensitive credit card numbers are strictly NEVER stored or processed on the client.
 */
export class PaymentService {
  /**
   * Status of the online payment gateway integration
   */
  static isGatewayConfigured(): boolean {
    // In current deployment, payment gateway is prepared for future credentials (Stripe / Mercado Pago / Asaas)
    return false;
  }

  /**
   * Initializes order payment processing
   */
  static async processPayment(preference: PaymentPreference): Promise<PaymentResult> {
    // Contractual requirement: "Pagamento online será configurado posteriormente."
    return {
      success: true,
      status: 'configured_later',
      message: 'Pedido registrado com sucesso no Studio Black7.',
      providerNotice: 'Pagamento online será configurado posteriormente.'
    };
  }
}
