import { Order } from '../types';
import { PixPaymentResult } from './paymentService';

export type SavedStorePayment = { order: Order; pix: PixPaymentResult; state: 'pending' | 'paid' | 'expired' | 'cancelled' };
const KEY = 'sb7-client-store-payments';
export const STORE_PAYMENTS_EVENT = 'sb7-store-payments';
export function readStorePayments(): SavedStorePayment[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value.filter(r => r?.order?.id && /^ORD[A-Z0-9]+$/i.test(r?.pix?.orderId || '') && Array.isArray(r.order.items)) : [];
  } catch { return []; }
}
export function rememberStorePayment(record: SavedStorePayment) {
  localStorage.setItem(KEY, JSON.stringify([record, ...readStorePayments().filter(r => r.order.id !== record.order.id)].slice(0, 20)));
  window.dispatchEvent(new Event(STORE_PAYMENTS_EVENT));
}
export function removeStorePayment(id: string) {
  localStorage.setItem(KEY, JSON.stringify(readStorePayments().filter(r => r.order.id !== id)));
  window.dispatchEvent(new Event(STORE_PAYMENTS_EVENT));
}
