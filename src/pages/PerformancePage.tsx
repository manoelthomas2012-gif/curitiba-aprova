import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Award } from 'lucide-react';
import { AppState } from '../types';
import { computeAchievements, computeAnalytics } from '../utils/priorityEngine';

export const PerformancePage: React.FC<{ state: AppState }> = ({ state }) => {
  const analytics = computeAnalytics(state);
  const achievements = computeAchievements(state, analytics);

  const discChart = analytics.byDiscipline
    .filter((d) => d.accuracy !== null)
    .map((d) => ({ name: d.shortName, aproveitamento: d.accuracy ?? 0 }));

  if (analytics.totalQuestions === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Continue estudando para gerar seu relatório de desempenho.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Horas Estudadas</div>
          <div className="mt-1 text-2xl font-bold">{analytics.totalHours}h</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Dias Estudados</div>
          <div className="mt-1 text-2xl font-bold">{analytics.daysStudied}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Média Geral de Acertos</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{analytics.accuracyPercent}%</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Questões Respondidas</div>
          <div className="mt-1 text-2xl font-bold">{analytics.totalQuestions}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold">Aproveitamento por Disciplina (%)</h3>
          <div className="mt-4 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={discChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="aproveitamento" fill="#17365D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
          <h3 className="text-sm font-bold mb-3">Resumo por Disciplina (Dados Reais)</h3>
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700">
              <tr>
                <th className="py-2">Disciplina</th>
                <th className="py-2">Questões</th>
                <th className="py-2">Aproveitamento</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {analytics.byDiscipline.map((d) => (
                <tr key={d.disciplineId}>
                  <td className="py-2.5 font-medium">{d.shortName}</td>
                  <td className="py-2.5">{d.correct}/{d.solved}</td>
                  <td className="py-2.5 font-semibold">{d.accuracy !== null ? `${d.accuracy}%` : '—'}</td>
                  <td className="py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      d.status === 'Consolidado' ? 'bg-emerald-100 text-emerald-800'
                      : d.status === 'Revisar' ? 'bg-amber-100 text-amber-800'
                      : d.status === 'Prioridade' ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marcos de Evolução (Gamificação Discreta) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-4 w-4 text-[#17365D] dark:text-blue-400" />
          <h3 className="text-sm font-bold">Marcos de Disciplina e Evolução</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((a) => (
            <div key={a.id} className={`rounded-lg border p-3.5 text-xs ${a.unlocked ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20' : 'border-slate-200 opacity-70 dark:border-slate-800'}`}>
              <div className="font-bold text-slate-900 dark:text-white">{a.title}</div>
              <p className="mt-1 text-slate-600 dark:text-slate-400">{a.description}</p>
              <div className="mt-2 font-semibold text-blue-600">{a.progressText}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de Sessões */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold mb-3">Histórico Completo de Sessões</h3>
        <div className="space-y-2">
          {state.sessions.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-4 py-3 text-xs dark:border-slate-800">
              <div>
                <strong>{s.label}</strong> · <span className="text-slate-500">{s.date.split('-').reverse().join('/')}</span>
                <p className="text-slate-500 mt-0.5">{s.notes}</p>
              </div>
              <div className="flex items-center gap-3 font-semibold">
                <span>{s.minutesStudied} min</span>
                {s.questionsAnswered > 0 && (
                  <span className="text-blue-600">
                    {s.correctAnswers}/{s.questionsAnswered} ({Math.round((s.correctAnswers / s.questionsAnswered) * 100)}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
