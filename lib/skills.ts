export interface Skill {
  id: string;
  name: string;
  description: string; // décrit QUAND ce skill doit se déclencher
  content: string; // les instructions données à l'IA quand le skill est actif
}

const KEY = 'custom-skills';

export function loadSkills(): Skill[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSkill(skill: Skill) {
  const all = loadSkills().filter((s) => s.id !== skill.id);
  all.push(skill);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteSkill(id: string) {
  const all = loadSkills().filter((s) => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}
