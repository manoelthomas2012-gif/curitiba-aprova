import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  PlayCircle,
  BookOpen,
  FileQuestion,
  ClipboardCheck,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  FileText,
  FolderOpen,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  Timer,
} from 'lucide-react';
import { NavRoute } from '../types';
import { daysUntil } from '../utils/priorityEngine';

interface LayoutProps {
  activeRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  darkMode: boolean;
  onToggleDark: () => void;
  examDate: string;
  timerRunning: boolean;
  elapsedSeconds: number;
  pendingReviewsCount: number;
  activeErrorsCount: number;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: NavRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'plan', label: 'Meu plano de estudos', icon: CalendarClock },
  { id: 'study-now', label: 'Estudar agora', icon: PlayCircle },
  { id: 'disciplines', label: 'Disciplinas', icon: BookOpen },
  { id: 'questions', label: 'Banco de questões', icon: FileQuestion },
  { id: 'simulados', label: 'Simulados', icon: ClipboardCheck },
  { id: 'errors', label: 'Caderno de erros', icon: AlertTriangle },
  { id: 'reviews', label: 'Revisões', icon: RefreshCw },
  { id: 'performance', label: 'Meu desempenho', icon: BarChart3 },
  { id: 'edital', label: 'Edital', icon: FileText },
  { id: 'materials', label: 'Materiais', icon: FolderOpen },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const Layout: React.FC<LayoutProps> = ({
  activeRoute,
  onNavigate,
  darkMode,
  onToggleDark,
  examDate,
  timerRunning,
  elapsedSeconds,
  pendingReviewsCount,
  activeErrorsCount,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const remainingDays = daysUntil(examDate);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#17365D] text-xs font-bold text-white">
              CA
            </span>
            <span className="text-sm font-bold tracking-tight text-[#17365D] dark:text-white">
              CURITIBA APROVA
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Agente Administrativo 2026
          </p>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeRoute === item.id;
          const badge =
            item.id === 'reviews' && pendingReviewsCount > 0
              ? pendingReviewsCount
              : item.id === 'errors' && activeErrorsCount > 0
              ? activeErrorsCount
              : null;

          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#17365D] text-white dark:bg-blue-600'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </span>
              {badge !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    active
                      ? 'bg-white/20 text-white'
                      : item.id === 'errors'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        {remainingDays !== null && remainingDays >= 0 && (
          <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400">Prova objetiva (FAFIPA):</span>
            <div className="mt-0.5 flex items-baseline justify-between">
              <strong className="text-[#17365D] dark:text-blue-400">{remainingDays} dias</strong>
              <span className="text-slate-500 dark:text-slate-400">{examDate.split('-').reverse().join('/')}</span>
            </div>
          </div>
        )}
        <button
          onClick={onToggleDark}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] dark:bg-slate-950">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">{sidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-64 max-w-[80vw]">{sidebarContent}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {NAV_ITEMS.find((i) => i.id === activeRoute)?.label}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {(timerRunning || elapsedSeconds > 0) && (
              <button
                onClick={() => onNavigate('plan')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  timerRunning
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Timer className="h-3.5 w-3.5" />
                {fmtTime(elapsedSeconds)}
              </button>
            )}
            <button
              onClick={() => onNavigate('study-now')}
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Estudar agora
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
