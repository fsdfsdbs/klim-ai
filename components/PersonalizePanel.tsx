'use client';

import { useEffect, useState } from 'react';
import { loadSkills, saveSkill, deleteSkill, Skill } from '@/lib/skills';

interface Props {
  onClose: () => void;
}

const EMPTY: Skill = { id: '', name: '', description: '', content: '' };

export default function PersonalizePanel({ onClose }: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<Skill | null>(null);

  useEffect(() => {
    setSkills(loadSkills());
  }, []);

  const refresh = () => setSkills(loadSkills());

  const onSave = () => {
    if (!editing || !editing.name.trim() || !editing.content.trim()) return;
    saveSkill({ ...editing, id: editing.id || crypto.randomUUID() });
    setEditing(null);
    refresh();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
      <div className="bg-[#1C1C1A] border border-[#33302B] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#33302B]">
          <div>
            <h2 className="text-lg font-medium text-[#F5F1EB]">Skills personnalisés</h2>
            <p className="text-xs text-[#8A8578] mt-0.5">
              L'IA charge automatiquement le skill si ta question correspond à sa description.
            </p>
          </div>
          <button onClick={onClose} className="text-[#8A8578] hover:text-[#F5F1EB] text-xl">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing({ ...EMPTY })}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-[#3D3934] hover:border-[#D97757] text-[#B5AFA2] hover:text-[#D97757] rounded-xl py-3 mb-4 transition text-sm"
              >
                + Créer un skill
              </button>

              {skills.length === 0 && (
                <p className="text-sm text-[#6E6A62] text-center py-6">
                  Aucun skill pour l'instant. Exemple : "Style de code" → déclenché quand tu parles
                  de code, avec des règles précises (indentation, langage préféré, etc.)
                </p>
              )}

              <div className="space-y-2">
                {skills.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start justify-between gap-3 bg-[#232220] border border-[#33302B] rounded-xl px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#F5F1EB]">{s.name}</p>
                      <p className="text-xs text-[#8A8578] mt-0.5 line-clamp-2">{s.description}</p>
                    </div>
<div className="flex gap-2 shrink-0 items-center">
                      {s.builtin && (
                        <span className="text-[10px] bg-[#D97757]/15 text-[#D97757] px-2 py-0.5 rounded-full">
                          Officiel
                        </span>
                      )}
                      <button
                        onClick={() => setEditing(s)}
                        className="text-xs text-[#B5AFA2] hover:text-[#F5F1EB] px-2 py-1"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          deleteSkill(s.id);
                          refresh();
                        }}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#8A8578] block mb-1.5">Nom du skill</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Ex: Style de code TypeScript"
                  className="w-full bg-[#232220] border border-[#33302B] rounded-lg px-3 py-2 text-sm text-[#F5F1EB] outline-none focus:border-[#D97757]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8A8578] block mb-1.5">
                  Quand ce skill doit se déclencher
                </label>
                <input
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Ex: quand la question concerne du code TypeScript ou React"
                  className="w-full bg-[#232220] border border-[#33302B] rounded-lg px-3 py-2 text-sm text-[#F5F1EB] outline-none focus:border-[#D97757]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8A8578] block mb-1.5">
                  Instructions données à l'IA
                </label>
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  placeholder="Ex: Utilise toujours des types stricts, préfère les fonctions fléchées, indente avec 2 espaces..."
                  rows={6}
                  className="w-full bg-[#232220] border border-[#33302B] rounded-lg px-3 py-2 text-sm text-[#F5F1EB] outline-none focus:border-[#D97757] resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditing(null)}
                  className="text-sm text-[#8A8578] hover:text-[#F5F1EB] px-4 py-2"
                >
                  Annuler
                </button>
                <button
                  onClick={onSave}
                  className="text-sm bg-[#D97757] hover:bg-[#C86A4B] text-white rounded-lg px-4 py-2"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
