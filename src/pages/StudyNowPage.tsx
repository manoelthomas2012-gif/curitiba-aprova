import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, RotateCcw, BookOpen, HelpCircle, Award } from 'lucide-react';
import { AppState, DisciplineId } from '../types';
import { getStudyRecommendations, todayIso } from '../utils/priorityEngine';

interface Props {
  state: AppState;
  onAnswerQuestion: (qId: string, letter: 'A' | 'B' | 'C' | 'D' | 'E') => void;
  onCompleteReview: (revId: string, rating: 'easy' | 'medium' | 'hard' | 'again') => void;
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
}

const STEPS = ['1. Revisão', '2. Aprendizado', '3. Prática', '4. Correção', '5. Registro'];

export const StudyNowPage: React.FC<Props> = ({
  state,
  onAnswerQuestion,
  onCompleteReview,
  onRegisterSession,
}) => {
  const [step, setStep] = useState(0);
  const [revealedReviews, setRevealedReviews] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  const [sessionNotes, setSessionNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const today = todayIso();
  const topRec = getStudyRecommendations(state)[0];
  const dueReviews = state.reviews.filter((r) => r.nextReviewDate <= today).slice(0, 3);
  const targetLesson =
    state.lessons.find((l) => l.topicId === topRec?.topicId) ??
    state.lessons.find((l) => l.id === state.lastLessonId) ??
    state.lessons[0];

  const practiceQuestions = state.questions
    .filter((q) => targetLesson.questionIds.includes(q.id) || q.topicId === targetLesson.topicId)
    .slice(0, 5);

  const correctCount = practiceQuestions.filter((q) => answers[q.id] === q.correctLetter).length;

  const handleFinalizePractice = () => {
    practiceQuestions.forEach((q) => {
      if (answers[q.id]) onAnswerQuestion(q.id, answers[q.id]);
    });
    setStep(3);
  };

  const handleSaveSession = () => {
    onRegisterSession({
      date: today,
      label: `Estudar Agora — ${targetLesson.number}`,
      disciplineId: targetLesson.disciplineId,
      topicName: targetLesson.topicName,
      minutesStudied: 90,
      questionsAnswered: practiceQuestions.length,
      correctAnswers: correctCount,
      wrongAnswers: practiceQuestions.length - correctCount,
      notes: sessionNotes || `Sessão guiada concluída em ${targetLesson.title}.`,
      type: 'Sessão Guiada',
    });
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Etapas */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          {STEPS.map((label, idx) => (
            <button
              key={label}
              onClick={() => setStep(idx)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                step === idx
                  ? 'bg-[#17365D] text-white dark:bg-blue-600'
                  : idx < step
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Etapa 1: Revisão */}
      {step === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-[#17365D] dark:text-blue-400">
            <RotateCcw className="h-5 w-5" />
            <h2 className="text-lg font-bold">Etapa 1 — Revisão Ativa do Dia (10 min)</h2>
          </div>
          {dueReviews.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Todas as revisões do dia estão em dia. Avance para o aprendizado.
            </p>
          ) : (
            <div className="space-y-3">
              {dueReviews.map((rev) => (
                <div key={rev.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div className="text-xs font-semibold text-amber-600">{rev.topicName}</div>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{rev.promptQuestion}</p>
                  {!revealedReviews[rev.id] ? (
                    <button
                      onClick={() => setRevealedReviews((p) => ({ ...p, [rev.id]: true }))}
                      className="mt-3 rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    >
                      Mostrar resposta esperada
                    </button>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                        {rev.expectedAnswer}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => onCompleteReview(rev.id, 'again')} className="rounded bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Revisar novamente</button>
                        <button onClick={() => onCompleteReview(rev.id, 'hard')} className="rounded bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Difícil</button>
                        <button onClick={() => onCompleteReview(rev.id, 'medium')} className="rounded bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">Médio</button>
                        <button onClick={() => onCompleteReview(rev.id, 'easy')} className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Fácil</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="pt-2">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Avançar para Aprendizado <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Etapa 2: Aprendizado */}
      {step === 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center gap-2 text-[#17365D] dark:text-blue-400">
            <BookOpen className="h-5 w-5" />
            <h2 className="text-lg font-bold">Etapa 2 — Aprendizado: {targetLesson.title} (25 min)</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Objetivo:</strong> {targetLesson.objective}</p>
          <div className="space-y-4">
            {targetLesson.theoryBlocks.map((b) => (
              <div key={b.heading} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{b.heading}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{b.content}</p>
                {b.highlight && (
                  <div className="mt-2.5 rounded-md border-l-4 border-blue-600 bg-blue-50 p-2.5 text-xs font-medium text-slate-800 dark:bg-blue-950/30 dark:text-blue-100">
                    {b.highlight}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-emerald-50/70 p-4 dark:bg-emerald-950/20">
              <h4 className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">Macetes</h4>
              <ul className="mt-2 list-disc pl-4 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                {targetLesson.mnemonics.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </div>
            <div className="rounded-lg bg-red-50/70 p-4 dark:bg-red-950/20">
              <h4 className="text-xs font-bold uppercase text-red-800 dark:text-red-300">Pegadinhas de Prova</h4>
              <ul className="mt-2 list-disc pl-4 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                {targetLesson.examTraps.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          </div>
          <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Avançar para Prática ({practiceQuestions.length} questões) <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Etapa 3: Prática */}
      {step === 2 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center gap-2 text-[#17365D] dark:text-blue-400">
            <HelpCircle className="h-5 w-5" />
            <h2 className="text-lg font-bold">Etapa 3 — Prática Direcionada (40 min)</h2>
          </div>
          {practiceQuestions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Questão {idx + 1} · {q.subtopic}</span>
                <span>{q.origin}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">{q.statement}</p>
              <div className="mt-3 space-y-2">
                {q.alternatives.map((alt) => (
                  <button
                    key={alt.letter}
                    onClick={() => setAnswers((p) => ({ ...p, [q.id]: alt.letter }))}
                    className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      answers[q.id] === alt.letter
                        ? 'border-blue-600 bg-blue-50 text-blue-950 dark:bg-blue-950/40 dark:text-blue-100'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                    }`}
                  >
                    <strong className="shrink-0">{alt.letter})</strong>
                    <span>{alt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleFinalizePractice}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Corrigir e analisar erros <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Etapa 4: Correção */}
      {step === 3 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Etapa 4 — Correção e Gabarito Comentado</h2>
            <span className="rounded-full bg-[#17365D] px-3.5 py-1 text-sm font-bold text-white">
              {correctCount}/{practiceQuestions.length} ({practiceQuestions.length ? Math.round((correctCount / practiceQuestions.length) * 100) : 0}%)
            </span>
          </div>
          {practiceQuestions.map((q, idx) => {
            const picked = answers[q.id];
            const ok = picked === q.correctLetter;
            return (
              <div key={q.id} className={`rounded-lg border p-4 ${ok ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20' : 'border-red-200 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/20'}`}>
                <div className="flex justify-between text-xs font-semibold">
                  <span>Questão {idx + 1} · {q.subtopic}</span>
                  <span className={ok ? 'text-emerald-700' : 'text-red-700'}>
                    {ok ? 'Acerto' : `Erro (Sua: ${picked ?? 'Em branco'} | Gabarito: ${q.correctLetter})`}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300">{q.detailedExplanation}</p>
              </div>
            );
          })}
          <button onClick={() => setStep(4)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Ir para Registro Final <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Etapa 5: Registro */}
      {step === 4 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <Award className="h-5 w-5" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Etapa 5 — Registro da Sessão</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Ao salvar, o sistema atualiza automaticamente seu Dashboard, Caderno de Erros, Revisões Espaçadas, Desempenho e Progresso do Edital.
          </p>
          <textarea
            rows={3}
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Anote o principal aprendizado ou dúvida que ficou desta sessão..."
            className="w-full rounded-lg border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          {!saved ? (
            <button onClick={handleSaveSession} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Registrar sessão completa
            </button>
          ) : (
            <div className="rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              Sessão salva com sucesso! Todos os seus indicadores foram atualizados.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
