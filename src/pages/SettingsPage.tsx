import React, { useState } from 'react';
import { Download, Upload, Trash2, ShieldAlert } from 'lucide-react';
import { AppState } from '../types';
import { exportBackupJson, parseBackupJson } from '../utils/storage';
import { ConfirmModal } from '../components/ConfirmModal';

interface Props {
  state: AppState;
  onUpdateConfig: (patch: Partial<AppState['config']>) => void;
  onImportState: (next: AppState) => void;
  onResetAll: () => void;
  onNotify: (msg: string) => void;
}

export const SettingsPage: React.FC<Props> = ({
  state,
  onUpdateConfig,
  onImportState,
  onResetAll,
  onNotify,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseBackupJson(String(reader.result ?? ''));
      if (parsed) {
        onImportState(parsed);
      } else {
        onNotify('Arquivo JSON inválido. Verifique se é um backup do CURITIBA APROVA.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Aviso de Privacidade e Sincronização Local */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200 flex gap-3">
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <strong>Armazenamento 100% Local (GitHub Pages sem Backend):</strong>
          <p className="mt-1 leading-relaxed">
            Todos os seus dados são salvos apenas neste navegador (LocalStorage). Eles <strong>não sincronizam automaticamente</strong> entre seu computador e seu celular. Sempre que mudar de dispositivo, clique em <strong>EXPORTAR MEUS ESTUDOS</strong> e importe o arquivo JSON no outro aparelho.
          </p>
        </div>
      </div>

      {/* Backup e Restauração */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h2 className="text-base font-bold">Backup e Restauração</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              exportBackupJson(state);
              onNotify('Backup JSON exportado com sucesso.');
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#17365D] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#1e4677] dark:bg-blue-600"
          >
            <Download className="h-4 w-4" /> EXPORTAR MEUS ESTUDOS
          </button>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30">
            <Upload className="h-4 w-4" /> IMPORTAR BACKUP
            <input type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Parâmetros do Concurso e Rotina */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h2 className="text-base font-bold">Perfil do Concurso e Meta Diária</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Data Oficial da Prova</label>
            <input
              type="date"
              value={state.config.examDate}
              onChange={(e) => onUpdateConfig({ examDate: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Meta Diária (minutos)</label>
            <input
              type="number"
              min={30}
              max={360}
              step={15}
              value={state.config.dailyGoalMinutes}
              onChange={(e) => onUpdateConfig({ dailyGoalMinutes: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium">
          <input
            type="checkbox"
            checked={state.config.darkMode}
            onChange={(e) => onUpdateConfig({ darkMode: e.target.checked })}
          />
          Ativar modo escuro
        </label>
      </div>

      {/* Zona de Reset */}
      <div className="rounded-xl border border-red-200 bg-white p-6 dark:border-red-900/50 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-red-600">Resetar Plataforma</h2>
        <p className="mt-1 text-xs text-slate-500">
          Restaura o CURITIBA APROVA para o estado inicial (com seu Diagnóstico, Recuperação, Aula 03 e Aula 04 pendente). Recomendamos exportar um backup antes.
        </p>
        <button
          onClick={() => setConfirmReset(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4" /> Resetar dados locais
        </button>
      </div>

      <ConfirmModal
        open={confirmReset}
        title="Confirmar reset da plataforma?"
        description="Todos os registros adicionais feitos após o histórico inicial serão removidos deste navegador. Essa ação não pode ser desfeita."
        confirmLabel="Sim, resetar tudo"
        danger
        onConfirm={() => {
          onResetAll();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};
