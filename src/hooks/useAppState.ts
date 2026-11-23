import { useEffect, useState, useCallback, useRef } from 'react';
import {
  AppState,
  ErrorReason,
  Flashcard,
  MaterialItem,
  Question,
  SimuladoAttempt,
  StudySession,
  EditalTopic,
  WeeklyPlanSlot,
} from '../types';
import { INITIAL_STATE } from '../data/seedData';
import { clearState, loadState, saveState } from '../utils/storage';
import { addDaysIso, nextInterval, todayIso } from '../utils/priorityEngine';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [toast, setToast] = useState<string | null>(null);

  // Timer global de estudo (NUNCA conta tempo pausado)
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.config.darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [state.config.darkMode]);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [timerRunning]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 3200);
  }, []);

  const answerQuestion = useCallback(
    (questionId: string, selected: 'A' | 'B' | 'C' | 'D' | 'E') => {
      const today = todayIso();
      setState((prev) => {
        const q = prev.questions.find((item) => item.id === questionId);
        if (!q) return prev;
        const isCorrect = q.correctLetter === selected;

        const updatedQuestions = prev.questions.map((item) =>
          item.id === questionId
            ? {
                ...item,
                attempts: item.attempts + 1,
                correctAttempts: item.correctAttempts + (isCorrect ? 1 : 0),
                lastAnswer: { selected, isCorrect, answeredAt: today },
              }
            : item
        );

        const updatedTopics = prev.topics.map((t) => {
          if (t.id !== q.topicId) return t;
          const solved = t.questionsSolved + 1;
          const correct = t.questionsCorrect + (isCorrect ? 1 : 0);
          const acc = Math.round((correct / solved) * 100);
          return {
            ...t,
            questionsSolved: solved,
            questionsCorrect: correct,
            status: acc < 70 ? 'Revisar' : t.status === 'Não iniciado' ? 'Estudando' : t.status,
          };
        });

        let updatedErrors = [...prev.errors];
        let updatedReviews = [...prev.reviews];

        if (!isCorrect) {
          const existingErr = updatedErrors.find((e) => e.questionId === q.id);
          const selAlt = q.alternatives.find((a) => a.letter === selected);
          const corAlt = q.alternatives.find((a) => a.letter === q.correctLetter);
          if (existingErr) {
            updatedErrors = updatedErrors.map((e) =>
              e.id === existingErr.id
                ? {
                    ...e,
                    errorCount: e.errorCount + 1,
                    errorDate: today,
                    nextReviewDate: addDaysIso(today, 1),
                    userAnswer: `${selected} (${selAlt?.text.slice(0, 45) ?? ''})`,
                    resolved: false,
                    mastery: 'Revisar',
                  }
                : e
            );
          } else {
            updatedErrors.unshift({
              id: `err-${Date.now()}`,
              questionId: q.id,
              questionStatement: q.statement,
              disciplineId: q.disciplineId,
              topicName: `${q.topicName} — ${q.subtopic}`,
              userAnswer: `${selected} (${selAlt?.text.slice(0, 45) ?? ''})`,
              correctAnswer: `${q.correctLetter} (${corAlt?.text.slice(0, 45) ?? ''})`,
              explanation: q.detailedExplanation,
              errorDate: today,
              errorCount: 1,
              nextReviewDate: addDaysIso(today, 1),
              mastery: 'Revisar',
              resolved: false,
            });
          }

          if (!updatedReviews.some((r) => r.topicId === q.topicId && r.nextReviewDate <= addDaysIso(today, 1))) {
            updatedReviews.unshift({
              id: `rev-${Date.now()}`,
              topicId: q.topicId,
              disciplineId: q.disciplineId,
              topicName: `${q.topicName} — ${q.subtopic}`,
              source: 'Caderno de Erros',
              intervalDays: 1,
              nextReviewDate: addDaysIso(today, 1),
              reviewCount: 0,
              mastery: 'Revisar',
              promptQuestion: q.statement,
              expectedAnswer: q.detailedExplanation,
            });
          }
        }

        return {
          ...prev,
          questions: updatedQuestions,
          topics: updatedTopics,
          errors: updatedErrors,
          reviews: updatedReviews,
        };
      });
    },
    []
  );

  const toggleFavoriteQuestion = useCallback((questionId: string) => {
    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, favorite: !q.favorite } : q
      ),
    }));
  }, []);

  const addQuestion = useCallback((q: Omit<Question, 'id' | 'attempts' | 'correctAttempts'>) => {
    setState((prev) => ({
      ...prev,
      questions: [
        { ...q, id: `q-custom-${Date.now()}`, attempts: 0, correctAttempts: 0 },
        ...prev.questions,
      ],
    }));
    showToast('Questão adicionada ao banco com sucesso.');
  }, [showToast]);

  const registerSession = useCallback(
    (session: Omit<StudySession, 'id'>) => {
      setState((prev) => ({
        ...prev,
        sessions: [{ ...session, id: `sess-${Date.now()}` }, ...prev.sessions],
      }));
      showToast('Sessão registrada e indicadores atualizados.');
    },
    [showToast]
  );

  const completeLessonStep = useCallback((lessonId: string, stepIndex: number) => {
    setState((prev) => ({
      ...prev,
      lastLessonId: lessonId,
      lessons: prev.lessons.map((l) => {
        if (l.id !== lessonId) return l;
        const steps = Array.from(new Set([...l.completedSteps, stepIndex]));
        const finished = steps.length >= 4 && l.lastResult !== undefined;
        return {
          ...l,
          completedSteps: steps,
          status: finished ? 'Concluída' : l.status === 'Pendente' ? 'Em andamento' : l.status,
        };
      }),
    }));
  }, []);

  const recordLessonResult = useCallback(
    (lessonId: string, correct: number, total: number) => {
      const today = todayIso();
      setState((prev) => {
        const lesson = prev.lessons.find((l) => l.id === lessonId);
        if (!lesson) return prev;
        const updatedLessons = prev.lessons.map((l) =>
          l.id === lessonId
            ? {
                ...l,
                completedSteps: Array.from(new Set([...l.completedSteps, 3])),
                status: 'Concluída' as const,
                lastResult: { correct, total, date: today },
              }
            : l
        );
        const newSession: StudySession = {
          id: `sess-${Date.now()}`,
          date: today,
          label: `${lesson.number} — Avaliação`,
          disciplineId: lesson.disciplineId,
          topicName: lesson.topicName,
          minutesStudied: Math.max(15, Math.round(elapsedSeconds / 60) || lesson.estimatedMinutes),
          questionsAnswered: total,
          correctAnswers: correct,
          wrongAnswers: total - correct,
          notes: `Avaliação concluída na ${lesson.number} (${correct}/${total}).`,
          type: 'Aula',
        };
        return {
          ...prev,
          lastLessonId: lessonId,
          lessons: updatedLessons,
          sessions: [newSession, ...prev.sessions],
        };
      });
      showToast('Resultado da aula salvo no histórico.');
    },
    [elapsedSeconds, showToast]
  );

  const recordSimulado = useCallback(
    (attempt: Omit<SimuladoAttempt, 'id'>) => {
      const id = `sim-${Date.now()}`;
      setState((prev) => ({
        ...prev,
        simulados: [{ ...attempt, id }, ...prev.simulados],
        sessions: [
          {
            id: `sess-${Date.now()}`,
            date: attempt.date,
            label: attempt.title,
            disciplineId: 'especificos',
            topicName: `Simulado (${attempt.mode})`,
            minutesStudied: Math.max(1, attempt.durationMinutes),
            questionsAnswered: attempt.totalQuestions,
            correctAnswers: attempt.correctCount,
            wrongAnswers: attempt.wrongCount,
            notes: `Nota ${attempt.scorePercent}% (${attempt.correctCount}/${attempt.totalQuestions}).`,
            type: 'Simulado',
          },
          ...prev.sessions,
        ],
      }));
      showToast('Simulado finalizado e relatório gerado.');
    },
    [showToast]
  );

  const updateErrorReason = useCallback((errorId: string, reason: ErrorReason) => {
    setState((prev) => ({
      ...prev,
      errors: prev.errors.map((e) => (e.id === errorId ? { ...e, reason } : e)),
    }));
  }, []);

  const toggleErrorResolved = useCallback((errorId: string) => {
    setState((prev) => ({
      ...prev,
      errors: prev.errors.map((e) =>
        e.id === errorId
          ? { ...e, resolved: !e.resolved, mastery: !e.resolved ? 'Em consolidação' : 'Revisar' }
          : e
      ),
    }));
  }, []);

  const createFlashcardFromError = useCallback(
    (errorId: string) => {
      setState((prev) => {
        const err = prev.errors.find((e) => e.id === errorId);
        if (!err) return prev;
        const fc: Flashcard = {
          id: `fc-err-${Date.now()}`,
          disciplineId: err.disciplineId,
          topicId: 'top-atos',
          topicName: err.topicName,
          front: err.questionStatement,
          back: `${err.correctAnswer} — ${err.explanation}`,
          intervalDays: 1,
          nextReviewDate: todayIso(),
          reviewCount: 0,
          mastery: 'Revisar',
        };
        return { ...prev, flashcards: [fc, ...prev.flashcards] };
      });
      showToast('Flashcard criado a partir do erro.');
    },
    [showToast]
  );

  const completeReview = useCallback(
    (reviewId: string, rating: 'easy' | 'medium' | 'hard' | 'again') => {
      const today = todayIso();
      setState((prev) => {
        const rev = prev.reviews.find((r) => r.id === reviewId);
        if (!rev) return prev;
        const nextDays = nextInterval(rev.intervalDays, rating);
        const newCount = rating === 'again' ? rev.reviewCount : rev.reviewCount + 1;
        const newMastery =
          rating === 'again' || rating === 'hard'
            ? 'Revisar'
            : newCount >= 3 && rating === 'easy'
            ? 'Dominado'
            : 'Em consolidação';

        return {
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  intervalDays: nextDays,
                  nextReviewDate: addDaysIso(today, nextDays),
                  lastReviewedAt: today,
                  reviewCount: newCount,
                  mastery: newMastery,
                }
              : r
          ),
          topics: prev.topics.map((t) =>
            t.id === rev.topicId
              ? { ...t, reviewCount: t.reviewCount + 1, lastReviewedAt: today }
              : t
          ),
        };
      });
      showToast('Revisão registrada e próximo intervalo agendado.');
    },
    [showToast]
  );

  const rateFlashcard = useCallback(
    (cardId: string, rating: 'easy' | 'medium' | 'hard' | 'again') => {
      const today = todayIso();
      setState((prev) => ({
        ...prev,
        flashcards: prev.flashcards.map((fc) => {
          if (fc.id !== cardId) return fc;
          const nextDays = nextInterval(fc.intervalDays, rating);
          const count = rating === 'again' ? fc.reviewCount : fc.reviewCount + 1;
          return {
            ...fc,
            intervalDays: nextDays,
            nextReviewDate: addDaysIso(today, nextDays),
            reviewCount: count,
            mastery: rating === 'again' || rating === 'hard' ? 'Revisar' : count >= 3 ? 'Dominado' : 'Em consolidação',
          };
        }),
      }));
      showToast('Flashcard avaliado no ciclo espaçado.');
    },
    [showToast]
  );

  const addFlashcard = useCallback(
    (card: Omit<Flashcard, 'id' | 'intervalDays' | 'nextReviewDate' | 'reviewCount' | 'mastery'>) => {
      setState((prev) => ({
        ...prev,
        flashcards: [
          {
            ...card,
            id: `fc-${Date.now()}`,
            intervalDays: 1,
            nextReviewDate: todayIso(),
            reviewCount: 0,
            mastery: 'Aprendendo',
          },
          ...prev.flashcards,
        ],
      }));
      showToast('Novo flashcard adicionado.');
    },
    [showToast]
  );

  const addEditalTopic = useCallback(
    (topic: Omit<EditalTopic, 'id' | 'lessonsCount' | 'questionsSolved' | 'questionsCorrect' | 'reviewCount'>) => {
      setState((prev) => ({
        ...prev,
        topics: [
          ...prev.topics,
          {
            ...topic,
            id: `top-${Date.now()}`,
            lessonsCount: 0,
            questionsSolved: 0,
            questionsCorrect: 0,
            reviewCount: 0,
          },
        ],
      }));
      showToast('Tópico adicionado ao edital.');
    },
    [showToast]
  );

  const updateTopicStatus = useCallback((topicId: string, status: EditalTopic['status']) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => (t.id === topicId ? { ...t, status } : t)),
    }));
  }, []);

  const addMaterial = useCallback(
    (mat: Omit<MaterialItem, 'id' | 'createdAt'>) => {
      setState((prev) => ({
        ...prev,
        materials: [{ ...mat, id: `mat-${Date.now()}`, createdAt: todayIso() }, ...prev.materials],
      }));
      showToast('Material salvo na biblioteca local.');
    },
    [showToast]
  );

  const toggleMaterialStudied = useCallback((matId: string) => {
    setState((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => (m.id === matId ? { ...m, studied: !m.studied } : m)),
    }));
  }, []);

  const updateWeeklyPlan = useCallback((weeklyPlan: WeeklyPlanSlot[]) => {
    setState((prev) => ({ ...prev, weeklyPlan }));
    showToast('Cronograma semanal atualizado.');
  }, [showToast]);

  const updateConfig = useCallback((patch: Partial<AppState['config']>) => {
    setState((prev) => ({ ...prev, config: { ...prev.config, ...patch } }));
  }, []);

  const importState = useCallback((next: AppState) => {
    setState(next);
    showToast('Backup importado e restaurado com sucesso.');
  }, [showToast]);

  const resetAll = useCallback(() => {
    clearState();
    setState(INITIAL_STATE);
    setTimerRunning(false);
    setElapsedSeconds(0);
    showToast('Plataforma restaurada para o histórico inicial.');
  }, [showToast]);

  return {
    state,
    toast,
    showToast,
    timerRunning,
    elapsedSeconds,
    startTimer: () => setTimerRunning(true),
    pauseTimer: () => setTimerRunning(false),
    resetTimer: () => {
      setTimerRunning(false);
      setElapsedSeconds(0);
    },
    answerQuestion,
    toggleFavoriteQuestion,
    addQuestion,
    registerSession,
    completeLessonStep,
    recordLessonResult,
    recordSimulado,
    updateErrorReason,
    toggleErrorResolved,
    createFlashcardFromError,
    completeReview,
    rateFlashcard,
    addFlashcard,
    addEditalTopic,
    updateTopicStatus,
    addMaterial,
    toggleMaterialStudied,
    updateWeeklyPlan,
    updateConfig,
    importState,
    resetAll,
  };
}
