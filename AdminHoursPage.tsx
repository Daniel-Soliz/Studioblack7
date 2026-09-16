import React, { useState } from 'react';
import { 
  Clock, 
  Check, 
  Save, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';

export const AdminHoursPage: React.FC = () => {
  const { settings, saveSettings } = useStore();
  const [feedback, setFeedback] = useState('');

  const [businessHoursWeekdays, setBusinessHoursWeekdays] = useState(
    settings.businessHoursWeekdays || '09h00–12h00 e 13h30–21h00'
  );
  const [businessHoursSaturday, setBusinessHoursSaturday] = useState(
    settings.businessHoursSaturday || '09h00–12h00 e 13h30–21h00'
  );
  const [businessHoursSunday, setBusinessHoursSunday] = useState(
    settings.businessHoursSunday || 'Fechado (Sob agendamento VIP)'
  );
  const [statusNote, setStatusNote] = useState(
    settings.statusNote || 'Segunda a Sábado com agendamento prioritário'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    saveSettings({
      ...settings,
      businessHoursWeekdays: businessHoursWeekdays.trim(),
      businessHoursSaturday: businessHoursSaturday.trim(),
      businessHoursSunday: businessHoursSunday.trim(),
      statusNote: statusNote.trim()
    });

    setFeedback('Horários de atendimento atualizados com sucesso! As páginas públicas já refletem a nova escala.');
    setTimeout(() => setFeedback(''), 3500);
  };

  return (
    <AdminLayout title="Horários de Atendimento">
      <div className="space-y-6 max-w-4xl mx-auto">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-xl sm:text-2xl font-black text-white">
              Escala &amp; Horários de Atendimento
            </h1>
            <p className="text-xs text-zinc-400">
              Configure a grade de horários de Segunda a Domingo exibida para agendamento.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Horários</span>
          </button>
        </div>

        {feedback && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5 shadow-xl">
            <div className="pb-3 border-b border-zinc-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="font-['Cinzel'] font-bold text-sm text-white">
                Grade Semanal
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Segunda a Sexta-feira
                </label>
                <input
                  type="text"
                  value={businessHoursWeekdays}
                  onChange={(e) => setBusinessHoursWeekdays(e.target.value)}
                  placeholder="09h00–12h00 e 13h30–21h00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Sábado
                </label>
                <input
                  type="text"
                  value={businessHoursSaturday}
                  onChange={(e) => setBusinessHoursSaturday(e.target.value)}
                  placeholder="09h00–12h00 e 13h30–21h00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Domingos e Feriados
                </label>
                <input
                  type="text"
                  value={businessHoursSunday}
                  onChange={(e) => setBusinessHoursSunday(e.target.value)}
                  placeholder="Fechado (Sob agendamento VIP)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Aviso de Atendimento / Status
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Segunda a Sábado com agendamento prioritário"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Visual Preview */}
          <div className="p-5 rounded-2xl bg-black/60 border border-zinc-800 space-y-3">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              Como aparecerá para os clientes no site
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block text-[11px]">Segunda a Sexta</span>
                <span className="text-white font-bold">{businessHoursWeekdays}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block text-[11px]">Sábado</span>
                <span className="text-white font-bold">{businessHoursSaturday}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 block text-[11px]">Domingos &amp; Feriados</span>
                <span className="text-white font-bold">{businessHoursSunday}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 shadow-xl shadow-amber-400/20 cursor-pointer"
            >
              Salvar Horários
            </button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};
