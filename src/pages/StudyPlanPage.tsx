import React, { useState } from 'react';
import { Play, Pause, RotateCcw, CheckSquare, Plus } from 'lucide-react';
import { AppState, DisciplineId, WeeklyPlanSlot } from '../types';
import { todayIso } from '../utils/priorityEngine';

interface Props {
  state: AppState;
  timerRunning: boolean;
  elapsedSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onRegisterSession: (session: {
    date: string;
    label: string;
    disciplineId: DisciplineId;
    topicName: string;
    minutesStudied: number;
    questionsAnswered: number;
    correctAnswers: number;
    wrongAnswers: number;
    notes: string;
    type: 'Sessão Guiada';
  }) => void;
  onUpdatePlan: (plan: WeeklyPlanSlot[]) => void;
}

const SESSION_BLOCKS = [
  { label: 'Revisão ativa do conteúdo anterior', minutes: 10, color: 'bg-amber-500' },
  { label: 'Teoria e explicação em blocos curtos', minutes: 25, color: 'bg-[#17365D]' },
  { label: 'Questões práticas (padrão FAFIPA)', minutes: 40, color: 'bg-blue-600' },
  { label: 'Correção, análise e registro dos erros', minutes: 15, color: 'bg-emerald-600' },
];

export const StudyPlanPage: React.FC<Props> = ({
  state,
  timerRunning,
  elapsedSeconds,
  onStart,
  onPause,
  onReset,
  onRegisterSession,
  onUpdatePlan,
}) => {
  const [disciplineId, setDisciplineId] = useState<DisciplineId>('especificos');
  const [topicName, setTopicName] = useState('Atos Administrativos e Arquivologia');
  const [questionsAnswered, setQuestionsAnswered] = useState(10);
  const [correctAnswers, setCorrectAnswers] = useState(8);
  const [notes, setNotes] = useState('');

  const hrs = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;

  const handleFinishSession = () => {
    onPause();
    const minutesStudied = Math.max(1, Math.round(elapsedSeconds / 60));
    onRegisterSession({
      date: todayIso(),
      label: `Sessão Cronometrada — ${topicName.slice(0, 28)}`,
      disciplineId,
      topicName,
      minutesStudied,
      questionsAnswered,
      correctAnswers: Math.min(correctAnswers, questionsAnswered),
      wrongAnswers: Math.max(0, questionsAnswered - correctAnswers),
      notes: notes || 'Sessão concluída via timer ativo (tempo pausado excluído).',
      type: 'Sessão Guiada',
    });
    onReset();
    setNotes('');
  };

  const handleEditMinutes = (dayIdx: number, blockIdx: number, newMinutes: number) => {
    const next = state.weeklyPlan.map((d, di) =>
      di !== dayIdx
        ? d
        : {
            ...d,
            blocks: d.blocks.map((b, bi) => (bi !== blockIdx ? b : { ...b, minutes: Math.max(0, newMinutes) })),
          }
    );
    onUpdatePlan(next);
  };

  return (
    <div className="space-y-6">
      {/* Timer Funcional de 90 Minutos */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Timer de Estudo Ativo (Pausa não contabiliza tempo)
            </span>
            <div className="mt-3 font-mono text-5xl font-bold tracking-tight text-[#17365D] dark:text-white">
              {String(hrs).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Meta diária realista: {state.config.dailyGoalMinutes} minutos (segunda a sexta-feira).
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {!timerRunning ? (
                <button
                  onClick={onStart}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Play className="h-4 w-4" />
                  {elapsedSeconds > 0 ? 'Continuar' : 'Iniciar'}
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                >
                  <Pause className="h-4 w-4" />
                  Pausar
                </button>
              )}
              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Estrutura padrão da sessão de 90 minutos
              </div>
              {SESSION_BLOCKS.map((b) => (
                <div key={b.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/70">
                  <span className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <strong>{b.minutes} min</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Encerrar e Registrar Sessão */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Encerrar e Registrar Sessão</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Disciplina</label>
                <select
                  value={disciplineId}
                  onChange={(e) => setDisciplineId(e.target.value as DisciplineId)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  {state.disciplines.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Tema estudado</label>
                <input
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Questões</label>
                  <input
                    type="number"
                    min={0}
                    value={questionsAnswered}
                    onChange={(e) => setQuestionsAnswered(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Acertos</label>
                  <input
                    type="number"
                    min={0}
                    max={questionsAnswered}
                    value={correctAnswers}
                    onChange={(e) => setCorrectAnswers(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Observações</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dificuldades percebidas, pontos para revisar..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <button
                onClick={handleFinishSession}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <CheckSquare className="h-4 w-4" />
                Encerrar e salvar tempo real ({Math.max(1, Math.round(elapsedSeconds / 60))} min)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cronograma Semanal Editável */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Cronograma Semanal Editável</h2>
            <p className="text-xs text-slate-500">Ajuste os minutos conforme sua semana de trabalho e faculdade.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Total útil: {state.weeklyPlan.filter((d) => !d.optional).reduce((acc, d) => acc + d.blocks.reduce((a, b) => a + b.minutes, 0), 0)} min/sem
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {state.weeklyPlan.map((day, dayIdx) => (
            <div
              key={day.day}
              className={`rounded-xl border p-4 ${
                day.optional
                  ? 'border-dashed border-slate-300 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <strong className="text-sm text-slate-900 dark:text-white">{day.day}</strong>
                {day.optional && (
                  <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    Opcional
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-2">
                {day.blocks.map((block, bIdx) => (
                  <div key={block.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-700 dark:text-slate-300">{block.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        step={15}
                        min={0}
                        max={180}
                        value={block.minutes}
                        onChange={(e) => handleEditMinutes(dayIdx, bIdx, Number(e.target.value))}
                        className="w-16 rounded border border-slate-300 px-2 py-1 text-right text-xs dark:border-slate-700 dark:bg-slate-800"
                      />
                      <span className="text-slate-500">m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
