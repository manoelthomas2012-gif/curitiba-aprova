import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft } from 'lucide-react';
import { AppState, Lesson } from '../types';

interface Props {
  state: AppState;
  initialLessonId?: string | null;
  onCompleteStep: (lessonId: string, stepIndex: number) => void;
  onRecordLessonResult: (lessonId: string, correct: number, total: number) => void;
  onAnswerQuestion: (qId: string, letter: 'A' | 'B' | 'C' | 'D' | 'E') => void;
}

export const DisciplinesPage: React.FC<Props> = ({
  state,
  initialLessonId,
  onCompleteStep,
  onRecordLessonResult,
  onAnswerQuestion,
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(initialLessonId ?? null);
  const [lessonAnswers, setLessonAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  const [showCorrection, setShowCorrection] = useState(false);

  const selectedLesson: Lesson | undefined = state.lessons.find((l) => l.id === selectedLessonId);

  if (selectedLesson) {
    const qs = state.questions.filter((q) => selectedLesson.questionIds.includes(q.id));
    const handleFinishQuiz = () => {
      let correct = 0;
      qs.forEach((q) => {
        const ans = lessonAnswers[q.id];
        if (ans) {
          onAnswerQuestion(q.id, ans);
          if (ans === q.correctLetter) correct += 1;
        }
      });
      setShowCorrection(true);
      onRecordLessonResult(selectedLesson.id, correct, qs.length);
    };

    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setSelectedLessonId(null);
            setShowCorrection(false);
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar para Disciplinas e Aulas
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold uppercase text-blue-600">
                {selectedLesson.number} · {selectedLesson.difficulty} · ~{selectedLesson.estimatedMinutes} min
              </span>
              <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{selectedLesson.title}</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                <strong>Objetivo:</strong> {selectedLesson.objective}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {selectedLesson.status}
              {selectedLesson.lastResult ? ` (${selectedLesson.lastResult.correct}/${selectedLesson.lastResult.total})` : ''}
            </span>
          </div>

          {/* 7. Revisão Inicial */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#17365D] dark:text-blue-400">1. Revisão Inicial (Active Recall)</h2>
              <button onClick={() => onCompleteStep(selectedLesson.id, 0)} className="text-xs font-semibold text-emerald-600 hover:underline">
                {selectedLesson.completedSteps.includes(0) ? 'Etapa concluída' : 'Marcar etapa concluída'}
              </button>
            </div>
            <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
              {selectedLesson.initialReview.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          {/* 8. Explicação Teórica + Tabela Comparativa */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#17365D] dark:text-blue-400">2. Explicação Teórica em Blocos Curtos</h2>
              <button onClick={() => onCompleteStep(selectedLesson.id, 1)} className="text-xs font-semibold text-emerald-600 hover:underline">
                {selectedLesson.completedSteps.includes(1) ? 'Etapa concluída' : 'Marcar etapa concluída'}
              </button>
            </div>
            {selectedLesson.theoryBlocks.map((b) => (
              <div key={b.heading} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{b.heading}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{b.content}</p>
                {b.highlight && (
                  <div className="mt-2.5 rounded-md border-l-4 border-blue-600 bg-blue-50 p-2.5 text-xs font-medium text-slate-800 dark:bg-blue-950/40 dark:text-blue-100">
                    {b.highlight}
                  </div>
                )}
              </div>
            ))}

            {selectedLesson.comparisonTable && (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {selectedLesson.comparisonTable.title}
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/70">
                    <tr>
                      {selectedLesson.comparisonTable.headers.map((h) => (
                        <th key={h} className="px-4 py-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {selectedLesson.comparisonTable.rows.map((row, idx) => (
                      <tr key={idx}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-4 py-2 text-slate-700 dark:text-slate-300">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 9, 10, 11, 12: Exemplos, Resumo, Macetes, Pegadinhas */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200">Exemplos Práticos de Prefeitura</h3>
              <ul className="mt-2 list-disc pl-4 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                {selectedLesson.practicalExamples.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200">Resumo Final</h3>
              <ul className="mt-2 list-disc pl-4 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                {selectedLesson.summary.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div className="rounded-lg bg-emerald-50/70 p-4 dark:bg-emerald-950/20">
              <h3 className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">Macetes</h3>
              <ul className="mt-2 list-disc pl-4 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                {selectedLesson.mnemonics.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </div>
            <div className="rounded-lg bg-red-50/70 p-4 dark:bg-red-950/20">
              <h3 className="text-xs font-bold uppercase text-red-800 dark:text-red-300">Pegadinhas de Prova</h3>
              <ul className="mt-2 list-disc pl-4 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                {selectedLesson.examTraps.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          </section>

          {/* 13, 14, 15, 16: Questões, Gabarito Comentado, Resultado, Registro de Erros */}
          <section className="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#17365D] dark:text-blue-400">
              Avaliação da Aula ({qs.length} questões)
            </h2>
            {qs.map((q, idx) => (
              <div key={q.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Questão {idx + 1} · {q.subtopic}</span>
                  <span>{q.origin}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-white">{q.statement}</p>
                <div className="mt-3 space-y-1.5">
                  {q.alternatives.map((alt) => (
                    <button
                      key={alt.letter}
                      onClick={() => setLessonAnswers((p) => ({ ...p, [q.id]: alt.letter }))}
                      className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs ${
                        lessonAnswers[q.id] === alt.letter
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <strong>{alt.letter})</strong>
                      <span>{alt.text}</span>
                    </button>
                  ))}
                </div>
                {showCorrection && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
                    <strong>Gabarito: {q.correctLetter}.</strong> {q.detailedExplanation}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={handleFinishQuiz}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Finalizar aula e registrar resultado
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {state.disciplines.map((d) => {
          const dTopics = state.topics.filter((t) => t.disciplineId === d.id);
          const solved = dTopics.reduce((acc, t) => acc + t.questionsSolved, 0);
          const correct = dTopics.reduce((acc, t) => acc + t.questionsCorrect, 0);
          const acc = solved > 0 ? Math.round((correct / solved) * 100) : null;
          return (
            <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-medium text-slate-500">{d.officialQuestionsCount} questões na prova</span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{d.name}</h3>
              <div className="mt-3 flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{dTopics.length} tópicos</span>
                <span>{acc !== null ? `${acc}% (${solved}q)` : 'Sem avaliação'}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Aulas Estruturadas (Base Inicial de Treinamento)</h2>
        <div className="mt-4 space-y-3">
          {state.lessons.map((l) => (
            <div key={l.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#17365D] dark:text-blue-400">{l.number}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{l.status}</span>
                  {l.lastResult && (
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Resultado: {l.lastResult.correct}/{l.lastResult.total}
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{l.title}</h3>
                <p className="text-xs text-slate-500">{l.objective}</p>
              </div>
              <button
                onClick={() => setSelectedLessonId(l.id)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#17365D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e4677] dark:bg-blue-600"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Abrir aula
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
