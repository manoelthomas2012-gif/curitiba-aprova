import React, { useEffect, useState } from 'react';
import { Flag, Clock, CheckCircle2, Play } from 'lucide-react';
import { AppState, Question, SimuladoAttempt } from '../types';
import { todayIso } from '../utils/priorityEngine';
import { ConfirmModal } from '../components/ConfirmModal';

interface Props {
  state: AppState;
  onRecordSimulado: (attempt: Omit<SimuladoAttempt, 'id'>) => void;
  onAnswerQuestion: (qId: string, letter: 'A' | 'B' | 'C' | 'D' | 'E') => void;
}

export const SimuladosPage: React.FC<Props> = ({ state, onRecordSimulado, onAnswerQuestion }) => {
  const [mode, setMode] = useState<'10' | '20' | '40' | 'dificuldades' | 'revisao'>('10');
  const [activeQs, setActiveQs] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [seconds, setSeconds] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastReport, setLastReport] = useState<SimuladoAttempt | null>(null);

  useEffect(() => {
    if (!activeQs) return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [activeQs]);

  const startSimulado = () => {
    let pool = [...state.questions];
    if (mode === 'dificuldades') {
      const errIds = new Set(state.errors.filter((e) => !e.resolved).map((e) => e.questionId));
      const weak = pool.filter((q) => errIds.has(q.id) || (q.lastAnswer && !q.lastAnswer.isCorrect));
      pool = weak.length >= 4 ? weak : pool;
    } else if (mode === 'revisao') {
      pool = pool.filter((q) => q.attempts > 0);
      if (pool.length < 4) pool = [...state.questions];
    }
    const targetCount = mode === '10' ? 10 : mode === '20' ? 20 : mode === '40' ? 40 : Math.min(10, pool.length);
    const chosen = pool.slice(0, Math.min(targetCount, pool.length));
    setActiveQs(chosen);
    setIdx(0);
    setAnswers({});
    setFlagged({});
    setSeconds(0);
    setLastReport(null);
  };

  const finishSimulado = () => {
    if (!activeQs) return;
    const byDiscipline: Record<string, { correct: number; total: number }> = {};
    const byTopic: Record<string, { correct: number; total: number }> = {};
    let correctCount = 0;

    activeQs.forEach((q) => {
      const sel = answers[q.id];
      const ok = sel === q.correctLetter;
      if (sel) onAnswerQuestion(q.id, sel);
      if (ok) correctCount += 1;

      const dName = state.disciplines.find((d) => d.id === q.disciplineId)?.shortName ?? q.disciplineId;
      byDiscipline[dName] = byDiscipline[dName] || { correct: 0, total: 0 };
      byDiscipline[dName].total += 1;
      if (ok) byDiscipline[dName].correct += 1;

      byTopic[q.topicName] = byTopic[q.topicName] || { correct: 0, total: 0 };
      byTopic[q.topicName].total += 1;
      if (ok) byTopic[q.topicName].correct += 1;
    });

    const strongTopics = Object.entries(byTopic)
      .filter(([, v]) => v.correct / v.total >= 0.7)
      .map(([k]) => k);
    const weakTopics = Object.entries(byTopic)
      .filter(([, v]) => v.correct / v.total < 0.7)
      .map(([k]) => k);

    const report: Omit<SimuladoAttempt, 'id'> = {
      title: `SIMULADO #${String(state.simulados.length + 1).padStart(2, '0')}`,
      date: todayIso(),
      mode,
      totalQuestions: activeQs.length,
      correctCount,
      wrongCount: activeQs.length - correctCount,
      scorePercent: Math.round((correctCount / activeQs.length) * 100),
      durationMinutes: Math.max(1, Math.round(seconds / 60)),
      byDiscipline,
      byTopic,
      strongTopics,
      weakTopics,
    };

    onRecordSimulado(report);
    setLastReport({ ...report, id: 'latest' });
    setActiveQs(null);
    setConfirmOpen(false);
  };

  if (activeQs) {
    const q = activeQs[idx];
    const answeredCount = Object.keys(answers).length;
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-[#17365D] dark:text-blue-400">
              <Clock className="h-4 w-4" />
              {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
            </span>
            <span>Respondidas: {answeredCount}/{activeQs.length}</span>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Finalizar simulado
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeQs.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setIdx(i)}
              className={`h-8 w-8 rounded-lg text-xs font-bold border ${
                i === idx
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : flagged[item.id]
                  ? 'border-amber-500 bg-amber-100 text-amber-900'
                  : answers[item.id]
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Questão {idx + 1} de {activeQs.length} · {q.topicName}</span>
            <button
              onClick={() => setFlagged((p) => ({ ...p, [q.id]: !p[q.id] }))}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 font-medium ${flagged[q.id] ? 'bg-amber-100 text-amber-800' : 'hover:bg-slate-100'}`}
            >
              <Flag className="h-3.5 w-3.5" /> {flagged[q.id] ? 'Marcada p/ revisão' : 'Marcar p/ revisar'}
            </button>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">{q.statement}</p>
          <div className="mt-4 space-y-2">
            {q.alternatives.map((alt) => (
              <button
                key={alt.letter}
                onClick={() => setAnswers((p) => ({ ...p, [q.id]: alt.letter }))}
                className={`flex w-full items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-xs ${
                  answers[q.id] === alt.letter
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <strong>{alt.letter})</strong>
                <span>{alt.text}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-between">
            <button
              disabled={idx === 0}
              onClick={() => setIdx((i) => i - 1)}
              className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={idx === activeQs.length - 1}
              onClick={() => setIdx((i) => i + 1)}
              className="rounded-lg bg-[#17365D] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>

        <ConfirmModal
          open={confirmOpen}
          title="Encerrar simulado agora?"
          description={`Você respondeu ${answeredCount} de ${activeQs.length} questões. Após confirmar, o simulado será corrigido e salvo no seu histórico.`}
          confirmLabel="Corrigir simulado"
          onConfirm={finishSimulado}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Gerar Novo Simulado</h2>
        <p className="mt-1 text-xs text-slate-500">Simulados com cronômetro, navegação entre questões e relatório comparativo.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { id: '10', label: 'Simulado 10 questões' },
            { id: '20', label: 'Simulado 20 questões' },
            { id: '40', label: 'Simulado Geral (até 40q)' },
            { id: 'dificuldades', label: 'Focado nas Dificuldades' },
            { id: 'revisao', label: 'Simulado de Revisão' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id as typeof mode)}
              className={`rounded-lg border px-3.5 py-2 text-xs font-semibold ${
                mode === opt.id ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={startSimulado}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Play className="h-4 w-4" /> Iniciar simulado
        </button>
      </div>

      {lastReport && (
        <div className="rounded-xl border border-emerald-200 bg-white p-6 dark:border-emerald-900/50 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-bold">{lastReport.title} — Relatório Final</h3>
            </div>
            <span className="rounded-full bg-[#17365D] px-3 py-1 text-sm font-bold text-white">
              Nota: {lastReport.scorePercent}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">Acertos: <strong>{lastReport.correctCount}</strong></div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">Erros: <strong>{lastReport.wrongCount}</strong></div>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">Tempo: <strong>{lastReport.durationMinutes} min</strong></div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
            <div>
              <strong className="text-emerald-700">Pontos fortes:</strong>
              <ul className="mt-1 list-disc pl-4">{lastReport.strongTopics.length ? lastReport.strongTopics.map((t) => <li key={t}>{t}</li>) : <li>Nenhum acima de 70%</li>}</ul>
            </div>
            <div>
              <strong className="text-red-600">Pontos de atenção:</strong>
              <ul className="mt-1 list-disc pl-4">{lastReport.weakTopics.length ? lastReport.weakTopics.map((t) => <li key={t}>{t}</li>) : <li>Nenhum abaixo de 70%</li>}</ul>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Histórico de Simulados</h3>
        {state.simulados.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">Nenhum simulado finalizado ainda. Inicie seu primeiro simulado acima.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {state.simulados.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-xs dark:border-slate-700">
                <div>
                  <strong>{s.title}</strong> · {s.date.split('-').reverse().join('/')} · {s.durationMinutes} min
                </div>
                <span className="font-bold text-blue-600">{s.scorePercent}% ({s.correctCount}/{s.totalQuestions})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
