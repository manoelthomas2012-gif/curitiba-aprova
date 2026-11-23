import { AppState } from '../types';
import { INITIAL_STATE } from '../data/seedData';

const STORAGE_KEY = 'curitiba_aprova_state_v1';

export function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !parsed.config || !Array.isArray(parsed.questions)) {
      return INITIAL_STATE;
    }
    return parsed;
  } catch {
    return INITIAL_STATE;
  }
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Falha silenciosa se quota de armazenamento estiver cheia
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignora erro de storage
  }
}

export function exportBackupJson(state: AppState): void {
  const payload = {
    app: 'CURITIBA_APROVA',
    exportedAt: new Date().toISOString(),
    data: state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `curitiba-aprova-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackupJson(rawText: string): AppState | null {
  try {
    const parsed = JSON.parse(rawText);
    const candidate = parsed?.data ?? parsed;
    if (
      candidate &&
      typeof candidate === 'object' &&
      candidate.config &&
      Array.isArray(candidate.disciplines) &&
      Array.isArray(candidate.questions) &&
      Array.isArray(candidate.sessions)
    ) {
      return candidate as AppState;
    }
    return null;
  } catch {
    return null;
  }
}
