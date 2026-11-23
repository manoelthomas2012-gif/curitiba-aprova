import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Play, AlertCircle, Clock, CheckCircle2, Flame, Target, ArrowRight } from 'lucide-react';
import { AppState, NavRoute } from '../types';
import { computeAnalytics, daysUntil, getStudyRecommendations, todayIso } from '../utils/priorityEngine';

interface Props {
  state: AppState;
  onNavigate: (route: NavRoute) => void;
  onOpenLesson: (lessonId: string) => void;
}

export const DashboardPage: React.FC<Props> = ({ state, onNavigate, onOpenLesson }) => {
  const analytics = computeAnalytics(state);
  const recommendations = getStudyRecommendations(state);
  const topRec = recommendations[0];
  const remainingDays = daysUntil(state.config.examDate);
  const today = todayIso();

  const pendingReviews = state.reviews.filter((r) => r.nextReviewDate <= today);
  const nextReview = [...state.reviews].sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))[0];
  const lastLesson = state.lessons.find((l) => l.id === state.lastLessonId) ?? state.lessons[state.lessons.length - 1];
  const lastSession = state.sessions[0];

  const chartData = [...state.sessions]
    .reverse()
    .filter((s) => s.questionsAnswered > 0)
    .map((s) => ({
      name: s.label.length > 18 ? s.label.slice(0, 18) + '…' : s.label,
      aproveitamento: Math.round((s.correctAnswers / s.questionsAnswered) * 100),
    }));

  const weeklyTarget = 450; // 90 min * 5 dias úteis
  const weeklyPercent = Math.min(100, Math.round((analytics.minutesThisWeek / weeklyTarget) * 100));

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Concurso */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-block rounded-md bg-[#17365D]/10 px-2.5 py-0.5 text-xs font-semibold text-[#17365D] dark:bg-blue-500/20 dark:text-blue-300">
              {state.config.editalNumber} · Banca {state.config.board}
            </span>
            <h1 className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">
              {state.config.examName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">{state.config.role}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Prova Objetiva</div>
              <div className="mt-0.5 text-lg font-bold text-[#17365D] dark:text-blue-400">
                {remainingDays !== null && remainingDays >= 0 ? `${remainingDays} dias restantes` : 'Definir data'}
              </div>
              <div className="text-xs text-slate-500">{state.config.examDate.split('-').reverse().join('/')}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Meta Diária</div>
              <div className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
                {analytics.minutesToday} / {state.config.dailyGoalMinutes} min
              </div>
              <div className="text-xs text-slate-500">Semanal: {weeklyPercent}% ({analytics.minutesThisWeek}/450m)</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Reais */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Questões Respondidas</span>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{analytics.totalQuestions}</div>
          <div className="mt-1 text-xs text-slate-500">{analytics.totalCorrect} acertos acumulados</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Percentual de Acertos</span>
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{analytics.accuracyPercent}%</div>
          <div className="mt-1 text-xs text-slate-500">Mínimo edital: 60% (60/100 pts)</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Revisões Pendentes</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{pendingReviews.length}</div>
          <div className="mt-1 text-xs text-slate-500">
            Próxima: {nextReview ? nextReview.nextReviewDate.split('-').reverse().join('/') : 'Nenhuma'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Sequência / Sessões</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{analytics.streakDays} dias</div>
          <div className="mt-1 text-xs text-slate-500">
            Última: {lastSession ? lastSession.label : 'Nenhuma'}
          </div>
        </div>
      </div>

      {/* Cards Principais: Continue de Onde Parou + Estudar Hoje */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              CONTINUE DE ONDE PAROU
            </div>
            <h2 className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white">
              {lastLesson.number}: {lastLesson.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Assunto: {lastLesson.topicName} · Status: <strong>{lastLesson.status}</strong>
            </p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progresso da aula</span>
                <span>{Math.round((lastLesson.completedSteps.length / 4) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${Math.round((lastLesson.completedSteps.length / 4) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => onOpenLesson(lastLesson.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#17365D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e4677] dark:bg-blue-600"
            >
              <Play className="h-4 w-4" />
              Continuar estudo
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900/50 dark:bg-blue-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#17365D] dark:text-blue-400">
                ESTUDAR HOJE (RECOMENDAÇÃO INTELIGENTE)
              </span>
              {topRec && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  Prioridade {topRec.priority}
                </span>
              )}
            </div>
            <h2 className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white">
              {topRec ? topRec.topicName : 'Sessão guiada de 90 minutos'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">
              {topRec?.reason}
            </p>
            <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
              Bloco recomendado: 10m revisão ativa → 25m teoria → 40m questões → 15m correção
            </div>
          </div>
          <div className="mt-5">
            <button
              onClick={() => onNavigate('study-now')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Iniciar sessão guiada (90 min)
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Evolução + Pontos de Atenção */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Evolução da Pontuação (%)</h3>
          <p className="text-xs text-slate-500">Calculada exclusivamente a partir das suas sessões reais</p>
          <div className="mt-4 h-60 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="aproveitamento" stroke="#2563EB" fill="#2563EB" fillOpacity={0.14} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Continue estudando para gerar sua curva de evolução.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">PONTOS DE ATENÇÃO (&lt; 70%)</h3>
          </div>
          <div className="mt-4 space-y-3">
            {analytics.attentionTopics.length > 0 ? (
              analytics.attentionTopics.map((item) => (
                <div key={item.topicId} className="rounded-lg border border-red-100 bg-red-50/50 p-3 dark:border-red-900/40 dark:bg-red-950/20">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-100">{item.disciplineName}</span>
                    <span className="text-red-600 dark:text-red-400">{item.accuracy}% ({item.solved}q)</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{item.name}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">Nenhum tópico avaliado abaixo de 70% no momento.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
