import React, { useState } from 'react';
import { Copy, ExternalLink, Loader2, QrCode, X } from 'lucide-react';
import { PaymentService, PixPaymentResult } from '../services/paymentService';
import { ServiceItem } from '../types';

interface PixServiceModalProps {
  service: ServiceItem;
  onClose: () => void;
}

export const PixServiceModal: React.FC<PixServiceModalProps> = ({ service, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pix, setPix] = useState<PixPaymentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generatePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) {
      setError('Informe nome e e-mail para gerar o Pix.');
      return;
    }

    setLoading(true);
    try {
      const result = await PaymentService.createServicePix({
        serviceId: service.id,
        customerName: name,
        customerEmail: email
      });
      setPix(result);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível gerar o Pix.');
    } finally {
      setLoading(false);
    }
  };

  const copyPix = async () => {
    if (!pix?.qrCode) return;
    await navigator.clipboard.writeText(pix.qrCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border border-amber-400/30 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">Pagamento do serviço</p>
            <h3 className="font-['Cinzel'] text-xl font-bold text-white mt-1">{service.name}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!pix ? (
          <form onSubmit={generatePix} className="p-6 space-y-4">
            <p className="text-sm text-zinc-300">
              Gere o Pix para o valor cadastrado deste serviço. Depois do pagamento, combine o horário pelo WhatsApp.
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-800 focus:border-amber-400 outline-none text-sm"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-800 focus:border-amber-400 outline-none text-sm"
            />
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">{error}</div>}
            <button
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-amber-400 text-zinc-950 font-black uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
              {loading ? 'Gerando Pix...' : 'Gerar Pix'}
            </button>
          </form>
        ) : (
          <div className="p-6 space-y-4 text-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">Valor</p>
              <p className="text-2xl font-mono font-black text-amber-400">
                R$ {pix.amount.toFixed(2).replace('.', ',')}
              </p>
            </div>

            {pix.qrCodeBase64 ? (
              <div className="w-56 h-56 mx-auto p-3 rounded-2xl bg-white">
                <img src={`data:image/png;base64,${pix.qrCodeBase64}`} alt="QR Code Pix" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-900 text-zinc-300 text-sm">
                QR visual indisponível. Use o Pix Copia e Cola abaixo.
              </div>
            )}

            {pix.qrCode && (
              <button type="button" onClick={copyPix} className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" />
                {copied ? 'Código copiado!' : 'Copiar Pix Copia e Cola'}
              </button>
            )}

            {pix.ticketUrl && (
              <a href={pix.ticketUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-xl border border-amber-400/30 text-amber-300 font-bold text-sm flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Abrir instruções do Mercado Pago
              </a>
            )}

            <p className="text-[11px] text-zinc-500">Pagamento em ambiente de teste enquanto a conta comercial não for ativada para produção.</p>
          </div>
        )}
      </div>
    </div>
  );
};
