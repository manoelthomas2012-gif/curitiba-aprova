import React, { useState } from 'react';
import { RefreshCw, Layers, Plus } from 'lucide-react';
import { AppState, DisciplineId } from '../types';
import { todayIso } from '../utils/priorityEngine';

interface Props {
  state: AppState;
  onCompleteReview: (revId: string, rating: 'easy' | 'medium' | 'hard' | 'again') => void;
  onRateFlashcard: (cardId: string, rating: 'easy' | 'medium' | 'hard' | 'again') => void;
  onAddFlashcard: (card: { disciplineId: DisciplineId; topicId: string; topicName: string; front: string; back: string }) => void;
}

export const ReviewsPage: React.FC<Props> = ({
  state,
  onCompleteReview,
  onRateFlashcard,
  onAddFlashcard,
}) => {
  const [tab, setTab] = useState<'reviews' | 'flashcards'>('reviews');
  const [revealedRev, setRevealedRev] = useState<Record<string, boolean>>({});
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTopic, setNewTopic] = useState('Atos Administrativos');
  const [newDisc, setNewDisc] = useState<DisciplineId>('especificos');

  const today = todayIso();
  const overdue = state.reviews.filter((r) => r.nextReviewDate < today);
  const dueToday = state.reviews.filter((r) => r.nextReviewDate === today);
  const future = state.reviews.filter((r) => r.nextReviewDate > today);

  const currentCard = state.flashcards[cardIdx % Math.max(1, state.flashcards.length)];

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    onAddFlashcard({
      disciplineId: newDisc,
      topicId: 'top-atos',
      topicName: newTopic,
      front: newFront.trim(),
      back: newBack.trim(),
    });
    setNewFront('');
    setNewBack('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('reviews')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold ${
              tab === 'reviews' ? 'bg-[#17365D] text-white dark:bg-blue-600' : 'bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Revisões de Hoje ({overdue.length + dueToday.length})
          </button>
          <button
            onClick={() => setTab('flashcards')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold ${
              tab === 'flashcards' ? 'bg-[#17365D] text-white dark:bg-blue-600' : 'bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Flashcards ({state.flashcards.length})
          </button>
        </div>
        <span className="text-xs text-slate-500">Ciclo espaçado: D+1 · D+3 · D+7 · D+14 · D+30</span>
      </div>

      {tab === 'reviews' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-red-200 bg-white p-4 dark:border-red-900/50 dark:bg-slate-900">
              <div className="text-slate-500">Atrasadas</div>
              <div className="mt-1 text-2xl font-bold text-red-600">{overdue.length}</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-900/50 dark:bg-slate-900">
              <div className="text-slate-500">Para hoje</div>
              <div className="mt-1 text-2xl font-bold text-amber-600">{dueToday.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-slate-500">Futuras</div>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{future.length}</div>
            </div>
          </div>

          <div className="space-y-3">
            {[...overdue, ...dueToday, ...future].map((rev) => {
              const isOverdue = rev.nextReviewDate < today;
              const isToday = rev.nextReviewDate === today;
              return (
                <div key={rev.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 font-semibold ${isOverdue ? 'bg-red-100 text-red-700' : isToday ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {isOverdue ? 'Atrasada' : isToday ? 'Hoje' : rev.nextReviewDate.split('-').reverse().join('/')}
                      </span>
                      <strong>{rev.topicName}</strong>
                      <span className="text-slate-500">· D+{rev.intervalDays} · {rev.mastery}</span>
                    </div>
                    <span className="text-slate-400">Origem: {rev.source}</span>
                  </div>
                  <p className="mt-2.5 text-sm font-medium text-slate-900 dark:text-white">{rev.promptQuestion}</p>
                  {!revealedRev[rev.id] ? (
                    <button
                      onClick={() => setRevealedRev((p) => ({ ...p, [rev.id]: true }))}
                      className="mt-3 rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Revelar resposta (Active Recall)
                    </button>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {rev.expectedAnswer}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => onCompleteReview(rev.id, 'again')} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">Errei (D+1)</button>
                        <button onClick={() => onCompleteReview(rev.id, 'hard')} className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800">Difícil (D+1)</button>
                        <button onClick={() => onCompleteReview(rev.id, 'medium')} className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-800">Médio (Avançar)</button>
                        <button onClick={() => onCompleteReview(rev.id, 'easy')} className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">Fácil (Saltar ciclo)</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {currentCard && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{currentCard.topicName} · {currentCard.mastery}</span>
                  <span>Cartão {(cardIdx % state.flashcards.length) + 1} de {state.flashcards.length}</span>
                </div>
                <div className="mt-6 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    {flipped ? 'VERSO (RESPOSTA)' : 'FRENTE (PERGUNTA)'}
                  </span>
                  <p className="mt-3 text-base font-semibold leading-relaxed text-slate-900 dark:text-white">
                    {flipped ? currentCard.back : currentCard.front}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setFlipped((f) => !f)}
                  className="w-full rounded-lg bg-[#17365D] py-2.5 text-xs font-semibold text-white hover:bg-[#1e4677] dark:bg-blue-600"
                >
                  {flipped ? 'Mostrar frente' : 'Virar cartão'}
                </button>
                {flipped && (
                  <div className="grid grid-cols-4 gap-2">
                    {(['again', 'hard', 'medium', 'easy'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          onRateFlashcard(currentCard.id, r);
                          setFlipped(false);
                          setCardIdx((i) => i + 1);
                        }}
                        className="rounded-lg border border-slate-200 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        {r === 'again' ? 'Rever' : r === 'hard' ? 'Difícil' : r === 'medium' ? 'Médio' : 'Fácil'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleCreateCard} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-600" /> Adicionar Novo Flashcard
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <select value={newDisc} onChange={(e) => setNewDisc(e.target.value as DisciplineId)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800">
                {state.disciplines.map((d) => <option key={d.id} value={d.id}>{d.shortName}</option>)}
              </select>
              <input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="Assunto" className="rounded-lg border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <textarea rows={2} value={newFront} onChange={(e) => setNewFront(e.target.value)} placeholder="Frente: pergunta direta ou conceito..." className="w-full rounded-lg border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800" />
            <textarea rows={3} value={newBack} onChange={(e) => setNewBack(e.target.value)} placeholder="Verso: resposta objetiva e explicação..." className="w-full rounded-lg border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800" />
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              Salvar Flashcard
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
