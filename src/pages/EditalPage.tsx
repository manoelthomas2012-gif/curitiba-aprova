import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppState, DisciplineId, EditalTopic, TopicStatus } from '../types';
import { computeMastery } from '../utils/priorityEngine';

interface Props {
  state: AppState;
  onUpdateStatus: (topicId: string, status: TopicStatus) => void;
  onAddTopic: (topic: Omit<EditalTopic, 'id' | 'lessonsCount' | 'questionsSolved' | 'questionsCorrect' | 'reviewCount'>) => void;
}

const STATUSES: TopicStatus[] = ['Não iniciado', 'Estudando', 'Revisar', 'Concluído', 'Dominado'];

export const EditalPage: React.FC<Props> = ({ state, onUpdateStatus, onAddTopic }) => {
  const [name, setName] = useState('');
  const [discId, setDiscId] = useState<DisciplineId>('especificos');
  const [desc, setDesc] = useState('');

  const total = state.topics.length;
  const notStarted = state.topics.filter((t) => t.status === 'Não iniciado').length;
  const inProgress = state.topics.filter((t) => t.status === 'Estudando' || t.status === 'Revisar').length;
  const done = state.topics.filter((t) => t.status === 'Concluído').length;
  const mastered = state.topics.filter((t) => t.status === 'Dominado').length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddTopic({
      disciplineId: discId,
      name: name.trim(),
      description: desc.trim() || 'Tópico cadastrado manualmente a partir do Anexo II do Edital nº 4/2026.',
      editalSource: 'Edital nº 4/2026 — Cadastro manual do candidato',
      status: 'Não iniciado',
    });
    setName('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold">PROGRESSO DO EDITAL — Edital nº 4/2026 (FAFIPA)</h2>
            <p className="text-xs text-slate-500">
              40 questões (100 pts, mín. 60 pts): Específicos (20), Português (5), RLM (5), Informática (5), Legislação (5).
            </p>
          </div>
          <a
            href="https://cpmc-fafipa.selecao.net.br/concurso/2-concurso-publico-do-municipio-de-curitiba-pr-medio"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Abrir portal oficial FAFIPA ↗
          </a>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">Não iniciado: <strong>{notStarted}/{total}</strong></div>
          <div className="rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">Em andamento/Revisar: <strong>{inProgress}/{total}</strong></div>
          <div className="rounded-lg bg-blue-50 p-3 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">Concluído: <strong>{done}/{total}</strong></div>
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">Dominado: <strong>{mastered}/{total}</strong></div>
        </div>
      </div>

      {/* Lista de Tópicos */}
      <div className="space-y-2.5">
        {state.topics.map((t) => {
          const disc = state.disciplines.find((d) => d.id === t.disciplineId);
          const acc = t.questionsSolved > 0 ? Math.round((t.questionsCorrect / t.questionsSolved) * 100) : 0;
          const mastery = computeMastery(acc, t.questionsSolved, t.reviewCount);
          return (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-[#17365D] dark:text-blue-400">{disc?.shortName}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-slate-800">Domínio real: {mastery}</span>
                  {t.questionsSolved > 0 && (
                    <span className="text-slate-500">{t.questionsCorrect}/{t.questionsSolved} ({acc}%)</span>
                  )}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{t.name}</div>
                <p className="text-xs text-slate-500">{t.description}</p>
              </div>
              <select
                value={t.status}
                onChange={(e) => onUpdateStatus(t.id, e.target.value as TopicStatus)}
                className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          );
        })}
      </div>

      {/* Cadastrar Tópico do Anexo II */}
      <form onSubmit={handleAdd} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5"><Plus className="h-4 w-4 text-blue-600" /> Cadastrar Tópico do Anexo II Oficial</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select value={discId} onChange={(e) => setDiscId(e.target.value as DisciplineId)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800">
            {state.disciplines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do tópico do edital" className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:col-span-2 dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição ou subtópicos (opcional)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
        <button type="submit" className="rounded-lg bg-[#17365D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e4677] dark:bg-blue-600">
          Adicionar ao Edital
        </button>
      </form>
    </div>
  );
};
