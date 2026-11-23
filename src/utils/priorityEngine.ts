import { AppState, DisciplineId, MasteryLevel } from '../types';

export const SPACED_INTERVALS: (1 | 3 | 7 | 14 | 30)[] = [1, 3, 7, 14, 30];

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(base: string, days: number): string {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(dateIso: string): number | null {
  if (!dateIso) return null;
  const now = new Date(todayIso() + 'T12:00:00').getTime();
  const target = new Date(dateIso + 'T12:00:00').getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function nextInterval(current: 1 | 3 | 7 | 14 | 30, rating: 'easy' | 'medium' | 'hard' | 'again'): 1 | 3 | 7 | 14 | 30 {
  const idx = SPACED_INTERVALS.indexOf(current);
  if (rating === 'again' || rating === 'hard') return 1;
  if (rating === 'medium') return SPACED_INTERVALS[Math.min(idx + 1, SPACED_INTERVALS.length - 1)];
  return SPACED_INTERVALS[Math.min(idx + 2, SPACED_INTERVALS.length - 1)];
}

export function computeMastery(accuracy: number, questionsSolved: number, reviewCount: number): MasteryLevel {
  if (questionsSolved === 0 && reviewCount === 0) return 'Não estudado';
  if (questionsSolved < 3) return 'Aprendendo';
  if (accuracy < 70) return 'Revisar';
  if (accuracy >= 80 && reviewCount >= 2 && questionsSolved >= 5) return 'Dominado';
  return 'Em consolidação';
}

export interface PriorityRecommendation {
  disciplineId: DisciplineId;
  disciplineName: string;
  topicId: string;
  topicName: string;
  priority: 'Alta' | 'Média' | 'Manutenção';
  reason: string;
  score: number;
}

export function getStudyRecommendations(state: AppState): PriorityRecommendation[] {
  const today = todayIso();
  const list: PriorityRecommendation[] = state.topics.map((t) => {
    const disc = state.disciplines.find((d) => d.id === t.disciplineId);
    const acc = t.questionsSolved > 0 ? Math.round((t.questionsCorrect / t.questionsSolved) * 100) : null;
    const activeErrors = state.errors.filter(
      (e) => !e.resolved && (e.disciplineId === t.disciplineId && e.topicName.toLowerCase().includes(t.name.split(' ')[0].toLowerCase()))
    ).length;
    const overdueReviews = state.reviews.filter(
      (r) => r.topicId === t.id && r.nextReviewDate <= today
    ).length;

    let score = 0;
    const reasons: string[] = [];

    if (overdueReviews > 0) {
      score += 40 * overdueReviews;
      reasons.push('há revisão pendente/atrasada');
    }
    if (activeErrors > 0) {
      score += 30 * activeErrors;
      reasons.push(`${activeErrors} erro(s) ativo(s) no caderno`);
    }
    if (acc !== null && acc < 50) {
      score += 35;
      reasons.push(`aproveitamento crítico (${acc}%)`);
    } else if (acc !== null && acc < 70) {
      score += 22;
      reasons.push(`aproveitamento abaixo de 70% (${acc}%)`);
    } else if (t.status === 'Estudando') {
      score += 25;
      reasons.push('conteúdo preparado e pendente de avaliação');
    } else if (t.status === 'Não iniciado') {
      score += 18;
      reasons.push('tópico ainda não iniciado no edital');
    }

    if (disc && disc.officialQuestionsCount >= 20) {
      score += 15; // Peso alto no edital (20/40 questões)
    }

    const priority: 'Alta' | 'Média' | 'Manutenção' =
      (acc !== null && acc < 50) || activeErrors > 0 || overdueReviews > 0
        ? 'Alta'
        : acc === null || acc < 80
        ? 'Média'
        : 'Manutenção';

    const reasonText =
      reasons.length > 0
        ? `Hoje vale priorizar ${t.name.split('(')[0].trim()} porque ${reasons.join(' e ')}.`
        : `Manutenção programada para consolidar ${t.name.split('(')[0].trim()}.`;

    return {
      disciplineId: t.disciplineId,
      disciplineName: disc?.name ?? t.disciplineId,
      topicId: t.id,
      topicName: t.name,
      priority,
      reason: reasonText,
      score,
    };
  });

  return list.sort((a, b) => b.score - a.score);
}

export interface AnalyticsSummary {
  totalQuestions: number;
  totalCorrect: number;
  accuracyPercent: number;
  minutesToday: number;
  minutesThisWeek: number;
  totalHours: number;
  daysStudied: number;
  streakDays: number;
  byDiscipline: {
    disciplineId: DisciplineId;
    name: string;
    shortName: string;
    solved: number;
    correct: number;
    accuracy: number | null;
    status: 'Consolidado' | 'Revisar' | 'Prioridade' | 'Sem dados';
  }[];
  attentionTopics: {
    topicId: string;
    name: string;
    disciplineName: string;
    accuracy: number;
    solved: number;
  }[];
  recurringErrors: {
    topicName: string;
    count: number;
    recommendation: string;
  }[];
}

export function computeAnalytics(state: AppState): AnalyticsSummary {
  const today = todayIso();
  const weekAgo = addDaysIso(today, -6);

  const totalQuestions = state.sessions.reduce((acc, s) => acc + s.questionsAnswered, 0);
  const totalCorrect = state.sessions.reduce((acc, s) => acc + s.correctAnswers, 0);
  const accuracyPercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const minutesToday = state.sessions
    .filter((s) => s.date === today)
    .reduce((acc, s) => acc + s.minutesStudied, 0);

  const minutesThisWeek = state.sessions
    .filter((s) => s.date >= weekAgo && s.date <= today)
    .reduce((acc, s) => acc + s.minutesStudied, 0);

  const totalMinutes = state.sessions.reduce((acc, s) => acc + s.minutesStudied, 0);
  const uniqueDates = Array.from(new Set(state.sessions.map((s) => s.date))).sort();

  // Sequência de dias estudados (considerando dias consecutivos até hoje ou última sessão recente)
  let streakDays = 0;
  if (uniqueDates.length > 0) {
    streakDays = 1;
    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const diff =
        (new Date(uniqueDates[i] + 'T12:00:00').getTime() -
          new Date(uniqueDates[i - 1] + 'T12:00:00').getTime()) /
        (1000 * 60 * 60 * 24);
      if (diff <= 2) streakDays += 1;
      else break;
    }
  }

  const byDiscipline = state.disciplines.map((d) => {
    const discTopics = state.topics.filter((t) => t.disciplineId === d.id);
    const solved = discTopics.reduce((acc, t) => acc + t.questionsSolved, 0);
    const correct = discTopics.reduce((acc, t) => acc + t.questionsCorrect, 0);
    const accuracy = solved > 0 ? Math.round((correct / solved) * 100) : null;
    const status: 'Consolidado' | 'Revisar' | 'Prioridade' | 'Sem dados' =
      accuracy === null
        ? 'Sem dados'
        : accuracy >= 80
        ? 'Consolidado'
        : accuracy >= 60
        ? 'Revisar'
        : 'Prioridade';
    return {
      disciplineId: d.id,
      name: d.name,
      shortName: d.shortName,
      solved,
      correct,
      accuracy,
      status,
    };
  });

  const attentionTopics = state.topics
    .filter((t) => t.questionsSolved > 0 && (t.questionsCorrect / t.questionsSolved) * 100 < 70)
    .map((t) => ({
      topicId: t.id,
      name: t.name,
      disciplineName: state.disciplines.find((d) => d.id === t.disciplineId)?.shortName ?? t.disciplineId,
      accuracy: Math.round((t.questionsCorrect / t.questionsSolved) * 100),
      solved: t.questionsSolved,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const errorMap: Record<string, number> = {};
  state.errors
    .filter((e) => !e.resolved)
    .forEach((e) => {
      errorMap[e.topicName] = (errorMap[e.topicName] || 0) + e.errorCount;
    });

  const recurringErrors = Object.entries(errorMap)
    .map(([topicName, count]) => ({
      topicName,
      count,
      recommendation: `Revisar a teoria curta de "${topicName}" e resolver 5 questões direcionadas sem consulta.`,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalQuestions,
    totalCorrect,
    accuracyPercent,
    minutesToday,
    minutesThisWeek,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    daysStudied: uniqueDates.length,
    streakDays,
    byDiscipline,
    attentionTopics,
    recurringErrors,
  };
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progressText: string;
}

export function computeAchievements(state: AppState, analytics: AnalyticsSummary): AchievementItem[] {
  const masteredTopics = state.topics.filter((t) => t.status === 'Dominado').length;
  return [
    {
      id: 'ach-first-session',
      title: 'Primeira Sessão',
      description: 'Registrou o primeiro estudo na plataforma.',
      unlocked: state.sessions.length >= 1,
      progressText: `${state.sessions.length}/1 sessão`,
    },
    {
      id: 'ach-100-q',
      title: '100 Questões Respondidas',
      description: 'Alcançou a marca de 100 questões resolvidas.',
      unlocked: analytics.totalQuestions >= 100,
      progressText: `${analytics.totalQuestions}/100 questões`,
    },
    {
      id: 'ach-7-days',
      title: '7 Dias de Consistência',
      description: 'Manteve 7 dias registrados de estudo.',
      unlocked: analytics.daysStudied >= 7,
      progressText: `${analytics.daysStudied}/7 dias`,
    },
    {
      id: 'ach-first-sim',
      title: 'Primeiro Simulado',
      description: 'Finalizou o primeiro simulado cronometrado.',
      unlocked: state.simulados.length >= 1,
      progressText: `${state.simulados.length}/1 simulado`,
    },
    {
      id: 'ach-80-acc',
      title: '80% de Aproveitamento',
      description: 'Atingiu 80% ou mais de acertos gerais (mín. 20 questões).',
      unlocked: analytics.totalQuestions >= 20 && analytics.accuracyPercent >= 80,
      progressText: `${analytics.accuracyPercent}% atual`,
    },
    {
      id: 'ach-first-mastered',
      title: 'Primeiro Assunto Dominado',
      description: 'Consolidou um tópico com revisões e alto acerto.',
      unlocked: masteredTopics >= 1,
      progressText: `${masteredTopics}/1 tópico`,
    },
    {
      id: 'ach-10-hours',
      title: '10 Horas Estudadas',
      description: 'Acumulou 10 horas reais no cronômetro.',
      unlocked: analytics.totalHours >= 10,
      progressText: `${analytics.totalHours}h/10h`,
    },
  ];
}
