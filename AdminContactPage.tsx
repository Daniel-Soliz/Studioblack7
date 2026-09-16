import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Instagram, 
  Mail, 
  Check, 
  Save, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';

export const AdminContactPage: React.FC = () => {
  const { settings, saveSettings } = useStore();
  const [feedback, setFeedback] = useState('');

  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || '+55 11 98726-7087');
  const [whatsappRaw, setWhatsappRaw] = useState(settings.whatsappRaw || '5511987267087');
  const [phone, setPhone] = useState(settings.phone || '(11) 98726-7087');
  const [email, setEmail] = useState(settings.email || 'contato@studioblack7.com.br');
  const [instagramStudio, setInstagramStudio] = useState(settings.instagramStudio || '@barber_black7_');
  const [instagramRay, setInstagramRay] = useState(settings.instagramRay || '@rayblakc7');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-clean raw whatsapp number if needed
    const cleanedRaw = whatsappRaw.replace(/\D/g, '') || whatsapp.replace(/\D/g, '');

    saveSettings({
      ...settings,
      whatsapp: whatsapp.trim(),
      whatsappRaw: cleanedRaw,
      phone: phone.trim(),
      email: email.trim(),
      instagramStudio: instagramStudio.trim(),
      instagramRay: instagramRay.trim(),
      instagram: `https://instagram.com/${instagramStudio.replace('@', '').trim()}`
    });

    setFeedback('Informações de contato e canais oficiais atualizados com sucesso!');
    setTimeout(() => setFeedback(''), 3500);
  };

  const testWhatsAppUrl = `https://wa.me/${whatsappRaw.replace(/\D/g, '')}?text=${encodeURIComponent('Olá Studio Black7! Gostaria de tirar uma dúvida.')}`;

  return (
    <AdminLayout title="Informações de Contato">
      <div className="space-y-6 max-w-4xl mx-auto">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-xl sm:text-2xl font-black text-white">
              Canais Oficiais de Atendimento
            </h1>
            <p className="text-xs text-zinc-400">
              Atualize os números de WhatsApp, Instagram e e-mails exibidos no cabeçalho, rodapé e botões flutuantes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Contatos</span>
          </button>
        </div>

        {feedback && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* WhatsApp & Telefone */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-['Cinzel'] font-bold text-sm text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                WhatsApp Principal &amp; Telefone
              </h3>
              <a
                href={testWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
              >
                <span>Testar Link WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  WhatsApp Formatado (Exibição Visual)
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+55 11 98726-7087"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Exibido visualmente para o cliente no site.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Número Limpo para Link (Apenas Dígitos com DDI e DDD)
                </label>
                <input
                  type="text"
                  value={whatsappRaw}
                  onChange={(e) => setWhatsappRaw(e.target.value)}
                  placeholder="5511987267087"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Usado para abrir a conversa direta wa.me/5511...
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Telefone Adicional / Fixo
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98726-7087"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  E-mail Oficial de Contato
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@studioblack7.com.br"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <div className="pb-3 border-b border-zinc-800">
              <h3 className="font-['Cinzel'] font-bold text-sm text-white flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-400" />
                Redes Sociais &amp; Instagram
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Perfis do Instagram do Studio Black7 e do fundador Ray Silva.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Instagram Oficial da Barbearia
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={instagramStudio}
                    onChange={(e) => setInstagramStudio(e.target.value)}
                    placeholder="@barber_black7_"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <a
                    href={`https://instagram.com/${instagramStudio.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-black/60 border border-zinc-750 text-zinc-300 hover:text-white hover:border-amber-400"
                    title="Visitar perfil"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Instagram Pessoal de Ray Silva
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={instagramRay}
                    onChange={(e) => setInstagramRay(e.target.value)}
                    placeholder="@rayblakc7"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <a
                    href={`https://instagram.com/${instagramRay.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-black/60 border border-zinc-750 text-zinc-300 hover:text-white hover:border-amber-400"
                    title="Visitar perfil"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 shadow-xl shadow-amber-400/20 cursor-pointer"
            >
              Salvar Alterações de Contato
            </button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};
