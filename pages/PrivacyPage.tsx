import React from 'react';
import { Header, Footer } from '../components';
import { useStore } from '../context/StoreContext';
export function PrivacyPage() {
  const { settings } = useStore();
  const phone = (settings.whatsappRaw || settings.whatsapp || '').replace(/\D/g,'');
  return <div className="min-h-screen bg-[#08080a] text-white"><Header /><main className="mx-auto max-w-3xl px-4 pt-32 pb-20 space-y-6">
    <h1 className="font-display text-3xl font-bold">Privacidade e seus dados</h1>
    <p className="text-zinc-300">O Studio Black7 usa os dados informados para organizar seu atendimento, sua compra e a confirmação do pagamento.</p>
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3"><h2 className="text-xl font-bold text-amber-400">O que é registrado</h2><p>Nome, telefone e e-mail; serviço e horário escolhido; produtos, valores e situação do pagamento. Nas compras com entrega, também registramos o endereço informado.</p><p className="text-sm text-zinc-400">Os dados dos clientes e o painel de pedidos têm acesso restrito ao administrador. O Mercado Pago processa o Pix; o site não solicita sua senha bancária.</p></section>
    <section className="space-y-3"><h2 className="text-xl font-bold">Dados neste celular</h2><p className="text-zinc-300">Carrinho e referências dos seus pedidos e agendamentos ficam salvos no navegador ou aplicativo usado. Em outro aparelho ou após apagar esses dados, esse histórico local pode não aparecer. No iPhone, o aplicativo instalado pode usar um armazenamento separado do Safari.</p><p className="text-zinc-300">Usamos identificadores técnicos para contar acessos e visitas estimadas. Esses números não identificam com certeza quantas pessoas físicas acessaram o site. O painel administrativo registra informações técnicas dos acessos para segurança.</p></section>
    <section className="space-y-3"><h2 className="text-xl font-bold">Serviços externos</h2><p className="text-zinc-300">O site utiliza Supabase para dados e imagens, Mercado Pago para pagamentos e recursos externos de mapas, fontes e imagens. Ao abrir o WhatsApp, você escolhe se deseja enviar a mensagem com os detalhes do atendimento ou pedido.</p></section>
    <section className="rounded-2xl border border-amber-400/30 p-5 space-y-3"><h2 className="text-xl font-bold">Precisa corrigir ou consultar seus dados?</h2><p>Fale com o Studio Black7. Pedidos de exclusão são avaliados considerando também registros financeiros e atendimentos em andamento.</p><a href={`https://wa.me/${phone}?text=${encodeURIComponent('Olá! Gostaria de falar sobre meus dados registrados no Studio Black7.')}`} className="inline-block rounded-xl bg-amber-400 px-5 py-3 font-bold text-black" target="_blank" rel="noopener noreferrer">Falar com o Studio</a></section>
  </main><Footer /></div>;
}
