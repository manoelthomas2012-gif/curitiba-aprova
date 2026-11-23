import React, { useState } from 'react';
import { ExternalLink, FileText, Plus, CheckCircle2 } from 'lucide-react';
import { AppState, DisciplineId, MaterialItem } from '../types';

interface Props {
  state: AppState;
  onAddMaterial: (mat: Omit<MaterialItem, 'id' | 'createdAt'>) => void;
  onToggleStudied: (id: string) => void;
}

export const MaterialsPage: React.FC<Props> = ({ state, onAddMaterial, onToggleStudied }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaterialItem['category']>('PDF');
  const [disciplineId, setDisciplineId] = useState<DisciplineId>('especificos');
  const [topicName, setTopicName] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const [localPdfName, setLocalPdfName] = useState<string>('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddMaterial({
      title: title.trim(),
      category,
      disciplineId,
      topicName: topicName.trim() || 'Geral',
      url: url.trim() || undefined,
      notes: notes.trim(),
      studied: false,
    });
    setTitle('');
    setTopicName('');
    setUrl('');
    setNotes('');
  };

  const handleOpenLocalPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localPdfUrl) URL.revokeObjectURL(localPdfUrl);
    setLocalPdfUrl(URL.createObjectURL(file));
    setLocalPdfName(file.name);
  };

  return (
    <div className="space-y-6">
      {/* Leitor Local de PDF (100% no navegador, sem envio externo) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" /> Leitor Local de PDF (Privado no Navegador)
            </h2>
            <p className="text-xs text-slate-500">Abra editais, apostilas e provas anteriores em PDF diretamente aqui sem enviar arquivos para nenhum servidor.</p>
          </div>
          <label className="cursor-pointer rounded-lg bg-[#17365D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e4677] dark:bg-blue-600">
            Selecionar PDF local
            <input type="file" accept="application/pdf" onChange={handleOpenLocalPdf} className="hidden" />
          </label>
        </div>
        {localPdfUrl && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Visualizando: {localPdfName}</div>
            <iframe src={localPdfUrl} title="Leitor de PDF local" className="h-[520px] w-full rounded-lg border border-slate-200 dark:border-slate-700" />
          </div>
        )}
      </div>

      {/* Biblioteca de Materiais */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {state.materials.map((m) => (
          <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold dark:bg-slate-800">{m.category}</span>
                <span className="text-slate-500">{m.topicName}</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{m.title}</h3>
              {m.notes && <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{m.notes}</p>}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              {m.url ? (
                <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                  Abrir link <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : <span />}
              <button
                onClick={() => onToggleStudied(m.id)}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold ${
                  m.studied ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> {m.studied ? 'Estudado' : 'Marcar estudado'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cadastrar Novo Material */}
      <form onSubmit={handleAdd} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5"><Plus className="h-4 w-4 text-blue-600" /> Cadastrar Material / Link / Legislação</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do material" className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:col-span-2 dark:border-slate-700 dark:bg-slate-800" />
          <select value={category} onChange={(e) => setCategory(e.target.value as MaterialItem['category'])} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800">
            {(['PDF', 'Apostila', 'Link', 'Prova Anterior', 'Resumo', 'Legislação', 'Anotação'] as const).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select value={disciplineId} onChange={(e) => setDisciplineId(e.target.value as DisciplineId)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800">
            {state.disciplines.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="Assunto" className="rounded-lg border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL externa (opcional)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" />
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações de estudo..." className="w-full rounded-lg border border-slate-300 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800" />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">Salvar material</button>
      </form>
    </div>
  );
};
