import React, { useMemo, useState } from 'react';
import { Star, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { AppState, Difficulty, DisciplineId } from '../types';

interface Props {
  state: AppState;
  onAnswerQuestion: (qId: string, letter: 'A' | 'B' | 'C' | 'D' | 'E') => void;
  onToggleFavorite: (qId: string) => void;
}

export const QuestionBankPage: React.FC<Props> = ({ state, onAnswerQuestion, onToggleFavorite }) => {
  const [discFilter, setDiscFilter] = useState<string>('all');
  const [diffFilter, setDiffFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [blockSize, setBlockSize] = useState<number>(10);
  const [immediateFeedback, setImmediateFeedback] = useState<boolean>(true);
  const [selectedMap, setSelectedMap] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    return state.questions
      .filter((q) => (discFilter === 'all' ? true : q.disciplineId === discFilter))
      .filter((q) => (diffFilter === 'all' ? true : q.difficulty === diffFilter))
      .filter((q) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'unanswered') return q.attempts === 0;
        if (statusFilter === 'wrong') return q.lastAnswer && !q.lastAnswer.isCorrect;
        if (statusFilter === 'correct') return q.lastAnswer?.isCorrect;
        if (statusFilter === 'favorite') return Boolean(q.favorite);
        return true;
      })
      .slice(0, blockSize);
  }, [state.questions, discFilter, diffFilter, statusFilter, blockSize]);

  const handleRespond = (qId: string) => {
    const letter = selectedMap[qId];
    if (!letter) return;
    onAnswerQuestion(qId, letter);
    if (immediateFeedback) {
      setRevealedMap((p) => ({ ...p, [qId]: true }));
    }
  };

  const handleRevealAll = () => {
    const next: Record<string, boolean> = {};
    filtered.forEach((q) => {
      if (selectedMap[q.id]) {
        onAnswerQuestion(q.id, selectedMap[q.id]);
        next[q.id] = true;
      }
    });
    setRevealedMap((p) => ({ ...p, ...next }));
  };

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <select value={discFilter} onChange={(e) => setDiscFilter(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800">
            <option value="all">Todas as disciplinas</option>
            {state.disciplines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800">
            <option value="all">Todas as dificuldades</option>
            {(['Fácil', 'Média', 'Difícil'] as Difficulty[]).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800">
            <option value="all">Todos os status</option>
            <option value="unanswered">Não respondidas</option>
            <option value="wrong">Somente erradas</option>
            <option value="correct">Somente corretas</option>
            <option value="favorite">Favoritas</option>
          </select>
          <select value={blockSize} onChange={(e) => setBlockSize(Number(e.target.value))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800">
            {[5, 10, 20, 40].map((n) => <option key={n} value={n}>Bloco de {n} questões</option>)}
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs dark:border-slate-700">
            <input type="checkbox" checked={immediateFeedback} onChange={(e) => setImmediateFeedback(e.target.checked)} />
            Correção imediata
          </label>
        </div>
        {!immediateFeedback && (
          <div className="mt-3 flex justify-end">
            <button onClick={handleRevealAll} className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
              Corrigir bloco completo
            </button>
          </div>
        )}
      </div>

      {/* Lista de Questões */}
      <div className="space-y-4">
        {filtered.map((q, idx) => {
          const picked = selectedMap[q.id];
          const revealed = revealedMap[q.id];
          const isCorrect = picked === q.correctLetter;

          return (
            <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#17365D] dark:text-blue-400">#{idx + 1}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium dark:bg-slate-800">{q.topicName}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{q.subtopic}</span>
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{q.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">{q.origin}</span>
                  <button onClick={() => onToggleFavorite(q.id)} aria-label="Favoritar questão">
                    <Star className={`h-4 w-4 ${q.favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-900 dark:text-white">{q.statement}</p>

              <div className="mt-3 space-y-2">
                {q.alternatives.map((alt) => {
                  const isSel = picked === alt.letter;
                  const isRight = alt.letter === q.correctLetter;
                  let cls = 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800';
                  if (revealed && isRight) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
                  else if (revealed && isSel && !isRight) cls = 'border-red-500 bg-red-50 dark:bg-red-950/30';
                  else if (isSel) cls = 'border-blue-600 bg-blue-50 dark:bg-blue-950/40';

                  return (
                    <button
                      key={alt.letter}
                      onClick={() => setSelectedMap((p) => ({ ...p, [q.id]: alt.letter }))}
                      className={`flex w-full flex-col rounded-lg border px-3.5 py-2.5 text-left text-xs transition-colors ${cls}`}
                    >
                      <div className="flex gap-2">
                        <strong className="shrink-0">{alt.letter})</strong>
                        <span>{alt.text}</span>
                      </div>
                      {revealed && (
                        <div className="mt-1.5 pl-5 text-[11px] text-slate-600 dark:text-slate-300">
                          {alt.explanation}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    disabled={!picked}
                    onClick={() => handleRespond(q.id)}
                    className="rounded-lg bg-[#17365D] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1e4677] disabled:opacity-40 dark:bg-blue-600"
                  >
                    Responder
                  </button>
                  {revealed && (
                    <button
                      onClick={() => {
                        setRevealedMap((p) => ({ ...p, [q.id]: false }));
                        setSelectedMap((p) => {
                          const c = { ...p };
                          delete c[q.id];
                          return c;
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium dark:border-slate-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Refazer
                    </button>
                  )}
                </div>
                {revealed && (
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {isCorrect ? 'Resposta correta!' : `Incorreta (Gabarito: ${q.correctLetter}) — adicionada ao Caderno de Erros`}
                  </span>
                )}
              </div>

              {revealed && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <strong>Comentário completo:</strong> {q.detailedExplanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
