export type NavRoute =
  | 'dashboard'
  | 'plan'
  | 'study-now'
  | 'disciplines'
  | 'questions'
  | 'simulados'
  | 'errors'
  | 'reviews'
  | 'performance'
  | 'edital'
  | 'materials'
  | 'settings';

export type DisciplineId =
  | 'especificos'
  | 'matematica'
  | 'portugues'
  | 'legislacao'
  | 'informatica';

export type MasteryLevel =
  | 'Não estudado'
  | 'Aprendendo'
  | 'Revisar'
  | 'Em consolidação'
  | 'Dominado';

export type TopicStatus =
  | 'Não iniciado'
  | 'Estudando'
  | 'Revisar'
  | 'Concluído'
  | 'Dominado';

export type Difficulty = 'Fácil' | 'Média' | 'Difícil';

export type QuestionOrigin =
  | 'Questão autoral para treinamento — estilo FAFIPA.'
  | 'Questão oficial de prova anterior'
  | 'Questão adaptada de prova anterior'
  | 'Questão inédita no estilo FAFIPA';

export type ErrorReason =
  | 'Falta de conhecimento'
  | 'Erro por interpretação'
  | 'Erro por distração'
  | 'Confusão entre conceitos'
  | 'Erro de cálculo';

export interface UserConfig {
  examName: string;
  role: string;
  board: string;
  editalNumber: string;
  examDate: string; // YYYY-MM-DD
  dailyGoalMinutes: number;
  darkMode: boolean;
  studentNote: string;
}

export interface Discipline {
  id: DisciplineId;
  name: string;
  shortName: string;
  officialQuestionsCount: number;
  pointsPerQuestion: number;
  weeklyMinutesTarget: number;
  color: string;
}

export interface EditalTopic {
  id: string;
  disciplineId: DisciplineId;
  name: string;
  description: string;
  editalSource: string;
  status: TopicStatus;
  lessonsCount: number;
  questionsSolved: number;
  questionsCorrect: number;
  reviewCount: number;
  lastReviewedAt?: string;
}

export interface LessonBlock {
  heading: string;
  content: string;
  highlight?: string;
}

export interface ComparisonTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface Lesson {
  id: string;
  number: string;
  title: string;
  disciplineId: DisciplineId;
  topicId: string;
  topicName: string;
  objective: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  initialReview: string[];
  theoryBlocks: LessonBlock[];
  comparisonTable?: ComparisonTable;
  practicalExamples: string[];
  summary: string[];
  mnemonics: string[];
  examTraps: string[];
  questionIds: string[];
  status: 'Pendente' | 'Em andamento' | 'Concluída' | 'Pendente de avaliação';
  completedSteps: number[]; // 0: revisão, 1: teoria, 2: exemplos/macetes, 3: questões
  lastResult?: {
    correct: number;
    total: number;
    date: string;
  };
}

export interface QuestionAlternative {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  explanation: string;
}

export interface Question {
  id: string;
  disciplineId: DisciplineId;
  topicId: string;
  topicName: string;
  subtopic: string;
  difficulty: Difficulty;
  board: string;
  year: number;
  origin: QuestionOrigin;
  sourceRef: string;
  sourceUrl?: string;
  statement: string;
  alternatives: QuestionAlternative[];
  correctLetter: 'A' | 'B' | 'C' | 'D' | 'E';
  detailedExplanation: string;
  favorite?: boolean;
  lastAnswer?: {
    selected: 'A' | 'B' | 'C' | 'D' | 'E';
    isCorrect: boolean;
    answeredAt: string;
  };
  attempts: number;
  correctAttempts: number;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  disciplineId: DisciplineId;
  topicName: string;
  minutesStudied: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  notes: string;
  type: 'Diagnóstico' | 'Recuperação' | 'Aula' | 'Sessão Guiada' | 'Simulado' | 'Revisão';
}

export interface SimuladoAttempt {
  id: string;
  title: string;
  date: string;
  mode: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  scorePercent: number;
  durationMinutes: number;
  byDiscipline: Record<string, { correct: number; total: number }>;
  byTopic: Record<string, { correct: number; total: number }>;
  strongTopics: string[];
  weakTopics: string[];
}

export interface ErrorEntry {
  id: string;
  questionId: string;
  questionStatement: string;
  disciplineId: DisciplineId;
  topicName: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  errorDate: string;
  errorCount: number;
  nextReviewDate: string;
  mastery: MasteryLevel;
  reason?: ErrorReason;
  resolved: boolean;
}

export interface ReviewItem {
  id: string;
  topicId: string;
  disciplineId: DisciplineId;
  topicName: string;
  source: 'Aula' | 'Caderno de Erros' | 'Flashcard' | 'Baixo Aproveitamento';
  intervalDays: 1 | 3 | 7 | 14 | 30;
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewedAt?: string;
  reviewCount: number;
  mastery: MasteryLevel;
  promptQuestion: string;
  expectedAnswer: string;
}

export interface Flashcard {
  id: string;
  disciplineId: DisciplineId;
  topicId: string;
  topicName: string;
  front: string;
  back: string;
  intervalDays: 1 | 3 | 7 | 14 | 30;
  nextReviewDate: string;
  reviewCount: number;
  mastery: MasteryLevel;
}

export interface MaterialItem {
  id: string;
  title: string;
  category: 'PDF' | 'Apostila' | 'Link' | 'Prova Anterior' | 'Resumo' | 'Legislação' | 'Anotação';
  disciplineId: DisciplineId;
  topicName: string;
  url?: string;
  notes: string;
  studied: boolean;
  createdAt: string;
}

export interface WeeklyPlanSlot {
  day: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';
  optional?: boolean;
  blocks: {
    id: string;
    disciplineId: DisciplineId | 'simulado';
    label: string;
    minutes: number;
  }[];
}

export interface AppState {
  version: string;
  config: UserConfig;
  disciplines: Discipline[];
  topics: EditalTopic[];
  lessons: Lesson[];
  questions: Question[];
  sessions: StudySession[];
  simulados: SimuladoAttempt[];
  errors: ErrorEntry[];
  reviews: ReviewItem[];
  flashcards: Flashcard[];
  materials: MaterialItem[];
  weeklyPlan: WeeklyPlanSlot[];
  lastLessonId: string;
}
