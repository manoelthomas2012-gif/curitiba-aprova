import React, { useEffect, useState } from 'react';
import { NavRoute } from './types';
import { useAppState } from './hooks/useAppState';
import { Layout } from './components/Layout';
import { Toast } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { StudyPlanPage } from './pages/StudyPlanPage';
import { StudyNowPage } from './pages/StudyNowPage';
import { DisciplinesPage } from './pages/DisciplinesPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { SimuladosPage } from './pages/SimuladosPage';
import { ErrorNotebookPage } from './pages/ErrorNotebookPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { PerformancePage } from './pages/PerformancePage';
import { EditalPage } from './pages/EditalPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { SettingsPage } from './pages/SettingsPage';
import { todayIso } from './utils/priorityEngine';

const VALID_ROUTES: NavRoute[] = [
  'dashboard', 'plan', 'study-now', 'disciplines', 'questions',
  'simulados', 'errors', 'reviews', 'performance', 'edital', 'materials', 'settings',
];

function getRouteFromHash(): NavRoute {
  const raw = window.location.hash.replace(/^#\/?/, '') as NavRoute;
  return VALID_ROUTES.includes(raw) ? raw : 'dashboard';
}

export default function App() {
  const app = useAppState();
  const [route, setRoute] = useState<NavRoute>(() => getRouteFromHash());
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);

  useEffect(() => {
    const onHash = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (next: NavRoute) => {
    setRoute(next);
    window.location.hash = `#/${next}`;
  };

  const today = todayIso();
  const pendingReviewsCount = app.state.reviews.filter((r) => r.nextReviewDate <= today).length;
  const activeErrorsCount = app.state.errors.filter((e) => !e.resolved).length;

  return (
    <Layout
      activeRoute={route}
      onNavigate={navigate}
      darkMode={app.state.config.darkMode}
      onToggleDark={() => app.updateConfig({ darkMode: !app.state.config.darkMode })}
      examDate={app.state.config.examDate}
      timerRunning={app.timerRunning}
      elapsedSeconds={app.elapsedSeconds}
      pendingReviewsCount={pendingReviewsCount}
      activeErrorsCount={activeErrorsCount}
    >
      {route === 'dashboard' && (
        <DashboardPage
          state={app.state}
          onNavigate={navigate}
          onOpenLesson={(lessonId) => {
            setOpenLessonId(lessonId);
            navigate('disciplines');
          }}
        />
      )}
      {route === 'plan' && (
        <StudyPlanPage
          state={app.state}
          timerRunning={app.timerRunning}
          elapsedSeconds={app.elapsedSeconds}
          onStart={app.startTimer}
          onPause={app.pauseTimer}
          onReset={app.resetTimer}
          onRegisterSession={app.registerSession}
          onUpdatePlan={app.updateWeeklyPlan}
        />
      )}
      {route === 'study-now' && (
        <StudyNowPage
          state={app.state}
          onAnswerQuestion={app.answerQuestion}
          onCompleteReview={app.completeReview}
          onRegisterSession={app.registerSession}
        />
      )}
      {route === 'disciplines' && (
        <DisciplinesPage
          state={app.state}
          initialLessonId={openLessonId}
          onCompleteStep={app.completeLessonStep}
          onRecordLessonResult={app.recordLessonResult}
          onAnswerQuestion={app.answerQuestion}
        />
      )}
      {route === 'questions' && (
        <QuestionBankPage
          state={app.state}
          onAnswerQuestion={app.answerQuestion}
          onToggleFavorite={app.toggleFavoriteQuestion}
        />
      )}
      {route === 'simulados' && (
        <SimuladosPage
          state={app.state}
          onRecordSimulado={app.recordSimulado}
          onAnswerQuestion={app.answerQuestion}
        />
      )}
      {route === 'errors' && (
        <ErrorNotebookPage
          state={app.state}
          onUpdateReason={app.updateErrorReason}
          onToggleResolved={app.toggleErrorResolved}
          onCreateFlashcard={app.createFlashcardFromError}
        />
      )}
      {route === 'reviews' && (
        <ReviewsPage
          state={app.state}
          onCompleteReview={app.completeReview}
          onRateFlashcard={app.rateFlashcard}
          onAddFlashcard={app.addFlashcard}
        />
      )}
      {route === 'performance' && <PerformancePage state={app.state} />}
      {route === 'edital' && (
        <EditalPage
          state={app.state}
          onUpdateStatus={app.updateTopicStatus}
          onAddTopic={app.addEditalTopic}
        />
      )}
      {route === 'materials' && (
        <MaterialsPage
          state={app.state}
          onAddMaterial={app.addMaterial}
          onToggleStudied={app.toggleMaterialStudied}
        />
      )}
      {route === 'settings' && (
        <SettingsPage
          state={app.state}
          onUpdateConfig={app.updateConfig}
          onImportState={app.importState}
          onResetAll={app.resetAll}
          onNotify={app.showToast}
        />
      )}
      <Toast message={app.toast} />
    </Layout>
  );
}
