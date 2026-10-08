import React, { useEffect, useState } from 'react';

async function request(body: Record<string,string>) {
  const res = await fetch('https://oyghjlwujdmgfkopujip.supabase.co/functions/v1/admin-recovery', {
    method:'POST',headers:{'Content-Type':'application/json',apikey:'sb_publishable_kqoxjdOKFyJ1MMMlKq8X5w_aL07wxYR'},body:JSON.stringify(body),cache:'no-store'
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Não foi possível recuperar o acesso.');
  return data.message as string;
}
export function AdminRecovery({onClose}: {onClose: () => void}) {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('recovery') || '');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [confirm,setConfirm] = useState('');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');
  const [done,setDone] = useState(false);
  useEffect(() => {
    if (token) window.history.replaceState(null,'',window.location.pathname + window.location.search);
  },[token]);
  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setError(''); setMessage('');
    if (token && password.trim() !== confirm.trim()) { setError('As senhas não conferem.'); return; }
    setBusy(true);
    try {
      setMessage(await request(token ? {action:'reset',token,password} : {action:'request',email}));
      if (token) {setDone(true);setPassword('');setConfirm('');}
    } catch (e) {setError(e instanceof Error ? e.message : 'Não foi possível conectar.');}
    finally {setBusy(false);}
  };
  const input='w-full rounded-xl bg-black/60 border border-zinc-700 px-4 py-3 text-white text-sm';
  return <section className="space-y-4">
    <h2 className="text-white font-bold text-lg">{token ? 'Criar nova senha' : 'Recuperar acesso'}</h2>
    <p className="text-zinc-400 text-sm">{token ? 'Defina sua nova senha do painel administrativo.' : 'Informe o e-mail de recuperação cadastrado no ADM. O link é válido por 15 minutos.'}</p>
    {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
    {message && <p role="status" className="text-emerald-300 text-sm">{message}</p>}
    {!done && <form onSubmit={submit} className="space-y-4">
      {token ? <>
        <label className="block text-zinc-300 text-sm">Nova senha<input className={input} type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)} /></label>
        <label className="block text-zinc-300 text-sm">Repita a nova senha<input className={input} type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={confirm} onChange={e=>setConfirm(e.target.value)} /></label>
      </> : <label className="block text-zinc-300 text-sm">E-mail de recuperação<input className={input} type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label>}
      <button disabled={busy} className="w-full rounded-xl bg-amber-400 text-zinc-950 py-3 font-bold disabled:opacity-50">{busy ? 'Aguarde…' : token ? 'Salvar nova senha' : 'Enviar link por e-mail'}</button>
    </form>}
    <button type="button" disabled={busy} onClick={onClose} className="text-amber-400 text-sm">Voltar para entrar no ADM</button>
  </section>;
}
