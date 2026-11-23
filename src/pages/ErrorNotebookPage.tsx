import React from 'react';
import { AlertTriangle, PlusCircle, CheckCircle2 } from 'lucide-react';
import { AppState, ErrorReason } from '../types';
import { computeAnalytics } from '../utils/priorityEngine';

interface Props {
  state: AppState;
  onUpdateReason: (errorId: string, reason: ErrorReason) => void;
  onToggleResolved: (errorId: string) => void;
  onCreateFlashcard: (errorId: string) => void;
}

const REASONS: ErrorReason[] = [
  'Falta de conhecimento',
  'Erro por interpretação',
  'Erro por distração',
  'Confusão entre conceitos',
  'Erro de cálculo',
];

export const ErrorNotebookPage: React.FC<Props> = ({
  state,
  onUpdateReason,
  onToggleResolved,
  onCreateFlashcard,
}) => {
  const analytics = computeAnalytics(state);

  return (
    <div className="space-y-6">
      {/* Card Meus Erros Recorrentes */}
      <div className="rounded-xl border border-red-200 bg-red-50/40 p-5 dark:border-red-900/50 dark:bg-red-950/20">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-sm font-bold uppercase tracking-wide">Meus Erros Recorrentes e Padrões</h2>
        </div>
        {analytics.recurringErrors.length === 0 ? (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            Nenhum erro ativo pendente no momento. Excelente controle!
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {analytics.recurringErrors.map((rec) => (
              <div key={rec.topicName} className="rounded-lg border border-red-200/80 bg-white p-3.5 text-xs dark:border-red-900/40 dark:bg-slate-900">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>{rec.topicName}</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                    {rec.count}x
                  </span>
                </div>
                <p className="mt-1.5 text-slate-600 dark:text-slate-400">{rec.recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Erros */}
      <div className="space-y-3">
        {state.errors.map((err) => (
          <div
            key={err.id}
            className={`rounded-xl border bg-white p-5 dark:bg-slate-900 ${
              err.resolved
                ? 'border-emerald-200 opacity-75 dark:border-emerald-900/50'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#17365D] dark:text-blue-400">{err.topicName}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">Erros: {err.errorCount}x</span>
                <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Próx. revisão: {err.nextReviewDate.split('-').reverse().join('/')}
                </span>
              </div>
              <span className="text-slate-500">Data: {err.errorDate.split('-').reverse().join('/')}</span>
            </div>

            <p className="mt-2.5 text-sm font-medium text-slate-900 dark:text-white">{err.questionStatement}</p>

            <div className="mt-3 grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
              <div className="rounded-lg bg-red-50 px-3 py-2 text-red-800 dark:bg-red-950/30 dark:text-red-300">
                <strong>Sua resposta:</strong> {err.userAnswer}
              </div>
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                <strong>Resposta correta:</strong> {err.correctAnswer}
              </div>
            </div>

            <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300">
              <strong>Explicação:</strong> {err.explanation}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Motivo do erro:</span>
                <select
                  value={err.reason ?? 'Falta de conhecimento'}
                  onChange={(e) => onUpdateReason(err.id, e.target.value as ErrorReason)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onCreateFlashcard(err.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Criar Flashcard
                </button>
                <button
                  onClick={() => onToggleResolved(err.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    err.resolved
                      ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {err.resolved ? 'Reabrir erro' : 'Marcar revisado'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
