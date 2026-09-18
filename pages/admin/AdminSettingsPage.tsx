import React, { useState } from 'react';
import { 
  Save, 
  Check, 
  KeyRound, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  FileJson, 
  AlertTriangle,
  Lock
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { SiteSettings } from '../../types';
import { AuthService } from '../../services/authService';

export const AdminSettingsPage: React.FC = () => {
  const { settings, saveSettings, exportData, importData, resetDefaults } = useStore();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
    setFeedback('Configurações do sistema salvas com sucesso!');
    setTimeout(() => setFeedback(''), 3500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Por favor, preencha todos os campos de senha.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação da senha não confere com a nova senha digitada.');
      return;
    }

    const result = await AuthService.changePassword(
      currentPassword.trim(),
      newPassword.trim()
    );

    if (!result.success) {
      setPasswordError(result.message);
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordFeedback(result.message || 'Senha administrativa atualizada com segurança!');
    setTimeout(() => setPasswordFeedback(''), 4500);
  };

  const handleExportBackup = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studioblack7_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFeedback('Arquivo de backup completo exportado com sucesso!');
    setTimeout(() => setFeedback(''), 3500);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importData(content);
      if (res.success) {
        setFeedback('Backup restaurado com sucesso! Todos os serviços, produtos e fotos foram carregados.');
        setFormData(settings);
      } else {
        setErrorMsg(res.message);
      }
      setTimeout(() => {
        setFeedback('');
        setErrorMsg('');
      }, 4000);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('ATENÇÃO: Deseja redefinir todos os dados para os padrões de fábrica do Studio Black7?')) {
      resetDefaults();
      setFeedback('Todos os dados foram redefinidos para os padrões originais com sucesso.');
      setTimeout(() => setFeedback(''), 3500);
    }
  };

  return (
    <AdminLayout title="Configurações do Sistema">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="font-['Cinzel'] text-xl sm:text-2xl font-black text-white">
            Configurações &amp; Segurança
          </h1>
          <p className="text-xs text-zinc-400">
            Gerencie a segurança de acesso, troca de senha e backups completos do site.
          </p>
        </div>

        {feedback && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400" />
            <span>{feedback}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-400/40 text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Alterar Senha de Acesso (Segura com SHA-256) */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-['Cinzel'] font-bold text-sm text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              1. Alterar Senha do Administrador
            </h3>
            <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Validação no servidor
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            A alteração da senha é validada pelo serviço de segurança do administrador e não depende apenas deste navegador.
          </p>

          {passwordFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{passwordFeedback}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-400/40 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider border border-zinc-700 hover:border-amber-400 transition-all cursor-pointer"
              >
                Atualizar Senha
              </button>
            </div>
          </form>
        </div>

        {/* 2. Backup & Exportação Completa */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div className="pb-3 border-b border-zinc-800">
            <h3 className="font-['Cinzel'] font-bold text-sm text-white flex items-center gap-2">
              <FileJson className="w-4 h-4 text-amber-400" />
              2. Backup &amp; Restauração de Dados
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Exporte todos os produtos, preços de serviços, fotos e textos em um arquivo JSON. Você pode restaurar em qualquer momento ou computador.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-white block">
                  Exportar Backup Completo
                </span>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Baixe um arquivo JSON com 100% dos dados cadastrados no painel.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportBackup}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Backup (JSON)</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-white block">
                  Restaurar via Arquivo JSON
                </span>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Selecione um arquivo de backup previamente exportado para restaurar.
                </p>
              </div>
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs uppercase tracking-wider border border-zinc-700 hover:border-amber-400 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Importar Arquivo JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* 3. Informações da Barbearia, Contato & Localização */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl">
          <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-['Cinzel'] font-bold text-sm text-white">
                3. Informações Comerciais &amp; Contato
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Altere telefone, WhatsApp de agendamento, horários de funcionamento e endereço da barbearia.
              </p>
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Tudo</span>
            </button>
          </div>

          {/* Dados Principais */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Identificação &amp; Redes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Nome da Barbearia
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  WhatsApp Principal (com DDD)
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => {
                    const val = e.target.value;
                    const raw = val.replace(/\D/g, '');
                    setFormData({ ...formData, whatsapp: val, whatsappRaw: raw });
                  }}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Telefone Fixo / Alternativo
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 3333-3333"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Instagram do Studio
                </label>
                <input
                  type="text"
                  value={formData.instagramStudio}
                  onChange={(e) => setFormData({ ...formData, instagramStudio: e.target.value })}
                  placeholder="@studioblack7_"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Instagram do Ray Barber
                </label>
                <input
                  type="text"
                  value={formData.instagramRay}
                  onChange={(e) => setFormData({ ...formData, instagramRay: e.target.value })}
                  placeholder="@ray_barber"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Alerta de Estoque Mínimo
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 3 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Horários de Funcionamento */}
          <div className="space-y-3 pt-2 border-t border-zinc-800/80">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Horários de Atendimento
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Segunda a Sexta-feira
                </label>
                <input
                  type="text"
                  value={formData.businessHoursWeekdays}
                  onChange={(e) => setFormData({ ...formData, businessHoursWeekdays: e.target.value })}
                  placeholder="09:00 às 20:00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Sábado
                </label>
                <input
                  type="text"
                  value={formData.businessHoursSaturday}
                  onChange={(e) => setFormData({ ...formData, businessHoursSaturday: e.target.value })}
                  placeholder="08:30 às 19:30"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Domingo e Feriados
                </label>
                <input
                  type="text"
                  value={formData.businessHoursSunday}
                  onChange={(e) => setFormData({ ...formData, businessHoursSunday: e.target.value })}
                  placeholder="Fechado ou Plantão especial"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Endereço e Localização */}
          <div className="space-y-3 pt-2 border-t border-zinc-800/80">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Endereço &amp; Localização
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, Número, Bairro, Cidade - Estado"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Ponto de Referência
                </label>
                <input
                  type="text"
                  value={formData.referencePoint || ''}
                  onChange={(e) => setFormData({ ...formData, referencePoint: e.target.value })}
                  placeholder="Próximo à praça central, em frente ao mercado..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Link do Google Maps (Rota)
                </label>
                <input
                  type="url"
                  value={formData.mapsUrl || ''}
                  onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-zinc-800">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider hover:brightness-105 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Todas as Informações</span>
            </button>
          </div>
        </form>

        {/* 4. Redefinir para Padrões */}
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-red-400 block">
              Zona de Perigo
            </span>
            <p className="text-[11px] text-zinc-400">
              Redefine todos os serviços, produtos, galeria e configurações para o estado original de fábrica.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Redefinir Padrões de Fábrica
          </button>
        </div>

      </div>
    </AdminLayout>
  );
};
