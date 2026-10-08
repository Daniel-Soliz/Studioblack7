import React, { useEffect, useState } from 'react';
import { CLOUD_SYNC_EVENT } from '../../services/cloudStoreService';

export function CloudSyncNotice() {
  const [status, setStatus] = useState<{ state: string; message?: string } | null>(null);
  useEffect(() => {
    const listener = (event: Event) => setStatus((event as CustomEvent).detail);
    window.addEventListener(CLOUD_SYNC_EVENT, listener);
    return () => window.removeEventListener(CLOUD_SYNC_EVENT, listener);
  }, []);
  if (!status) return null;
  return <div role={status.state === 'error' ? 'alert' : 'status'} className={'fixed top-2 left-1/2 -translate-x-1/2 z-[110] w-[calc(100%-24px)] max-w-xl rounded-xl border px-4 py-3 text-sm shadow-2xl ' + (status.state === 'error' ? 'border-red-400 bg-red-950 text-red-100' : 'border-emerald-600 bg-zinc-950 text-emerald-300')}>
    {status.state === 'saving' ? 'Salvando no servidor… Aguarde a confirmação.' : status.state === 'error' ? status.message : 'Alterações salvas no servidor.'}
    {status.state !== 'saving' && <button aria-label="Fechar aviso" onClick={() => setStatus(null)} className="float-right ml-2 px-2">×</button>}
  </div>;
}
