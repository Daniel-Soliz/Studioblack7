import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail, MessageSquareText, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { SupabaseRecoveryService } from '../../services/supabaseRecoveryService';
import { useStore } from '../../context/StoreContext';
import { getAssetUrl } from '../../utils';

export const AdminRecoveryPage: React.FC = () => {
  const { settings } = useStore();
  const navigate = useNavigate();
  const emailAccessToken = useMemo(
    () => SupabaseRecoveryService.getAccessTokenFromUrl(),
    []
  );

  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [step, setStep] = useState<'choose' | 'sms-code' | 'new-password'>(
    emailAccessToken ? 'new-password' : 'choose'
  );
  const [accessToken, setAccessToken] = useState(emailAccessToken);
  const [smsCode, setSmsCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState(
    emailAccessToken ? 'Link validado. Crie sua nova senha.' : ''
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestRecovery = async (selected: 'email' | 'sms') => {
    setMethod(selected);
    setError('');
    setFeedback('');
    setLoading(true);
    try {
      if (selected === 'email') {
        const result = await SupabaseRecoveryService.requestEmailRecovery();
        setFeedback(result.message + ' Abra o e-mail e clique no link recebido.');
      } else {
        const result = await SupabaseRecoveryService.requestSmsRecovery();
        setFeedback(result.message);
        setStep('sms-code');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível enviar a recuperação.';
      setError(
        selected === 'sms'
          ? `${message} Se o SMS ainda não estiver habilitado no provedor, use a recuperação por e-mail.`
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  const verifySms = async () => {
    setError('');
    setLoading(true);
    try {
      const token = await SupabaseRecoveryService.verifySms(smsCode);
      setAccessToken(token);
      setStep('new-password');
      setFeedback('Código confirmado. Agora crie sua nova senha.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async () => {
    setError('');
    if (newPassword.length < 8) {
      setError('Use uma senha com pelo menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As duas senhas precisam ser iguais.');
      return;
    }
    if (!accessToken) {
      setError('Sua validação expirou. Solicite uma nova recuperação.');
      return;
    }

    setLoading(true);
    try {
      await SupabaseRecoveryService.setPassword(accessToken, newPassword);
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/admin/login?senha=alterada', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/50 bg-black mx-auto mb-3">
            <img src={getAssetUrl(settings.logoUrl || '/images/ray_logo.png')} alt="Studio Black7" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-['Cinzel'] text-2xl font-black text-white">Recuperar acesso</h1>
          <p className="text-xs text-zinc-400 mt-1">Studio Black7 · Painel Administrativo</p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-5">
          {feedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'choose' && (
            <>
              <div>
                <h2 className="text-sm font-bold text-white">Como deseja recuperar?</h2>
                <p className="text-xs text-zinc-500 mt-1">O código ou link será enviado apenas aos contatos autorizados.</p>
              </div>

              <button type="button" disabled={loading} onClick={() => requestRecovery('email')} className="w-full p-4 rounded-2xl bg-black/40 border border-zinc-700 hover:border-amber-400 text-left transition-all disabled:opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center"><Mail className="w-5 h-5 text-amber-400" /></div>
                  <div>
                    <span className="text-sm font-bold text-white block">Recuperar por e-mail</span>
                    <span className="text-xs text-zinc-500">{SupabaseRecoveryService.maskedEmail()}</span>
                  </div>
                </div>
              </button>

              <button type="button" disabled={loading} onClick={() => requestRecovery('sms')} className="w-full p-4 rounded-2xl bg-black/40 border border-zinc-700 hover:border-amber-400 text-left transition-all disabled:opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center"><MessageSquareText className="w-5 h-5 text-amber-400" /></div>
                  <div>
                    <span className="text-sm font-bold text-white block">Recuperar por SMS</span>
                    <span className="text-xs text-zinc-500">{SupabaseRecoveryService.maskedPhone()}</span>
                  </div>
                </div>
              </button>

              {loading && <p className="text-xs text-center text-amber-400">Enviando recuperação...</p>}
            </>
          )}

          {step === 'sms-code' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase">Código recebido por SMS</label>
                <input inputMode="numeric" maxLength={10} value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g, ''))} className="mt-1.5 w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-700 text-white tracking-[0.3em] text-center text-lg focus:border-amber-400 focus:outline-none" placeholder="000000" />
              </div>
              <button type="button" disabled={loading || smsCode.length < 6} onClick={verifySms} className="w-full py-3 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs uppercase disabled:opacity-50">
                {loading ? 'Validando...' : 'Confirmar código'}
              </button>
              <button type="button" onClick={() => setStep('choose')} className="w-full text-xs text-zinc-500 hover:text-white">Escolher outro método</button>
            </div>
          )}

          {step === 'new-password' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <KeyRound className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Criar nova senha</span>
              </div>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-700 text-white focus:border-amber-400 focus:outline-none" placeholder="Nova senha — mínimo 8 caracteres" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-700 text-white focus:border-amber-400 focus:outline-none" placeholder="Confirmar nova senha" />
              <button type="button" disabled={loading} onClick={savePassword} className="w-full py-3.5 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs uppercase disabled:opacity-50">
                {loading ? 'Salvando...' : 'Definir nova senha'}
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800 text-center">
            <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
            </Link>
          </div>
        </div>

        <div className="mt-5 flex justify-center items-center gap-1.5 text-[11px] text-zinc-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Recuperação protegida por verificação de e-mail ou telefone</span>
        </div>
      </div>
    </div>
  );
};
