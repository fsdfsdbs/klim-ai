export interface Skill {
  id: string;
  name: string;
  description: string; // décrit QUAND ce skill doit se déclencher
  content: string; // les instructions données à l'IA quand le skill est actif
  builtin?: boolean;
}

const KEY = 'custom-skills';
const SEEDED_KEY = 'skills-seeded';

const SKILL_CREATOR: Skill = {
  id: 'skill-creator',
  name: 'Créateur de skills',
  description:
    "créer un skill, créer une compétence, structurer un skill, écrire un SKILL.md, améliorer un skill existant, packager des instructions réutilisables pour l'IA",
  builtin: true,
  content: `Tu sais créer des "skills" : des fiches d'instructions réutilisables que l'utilisateur peut ensuite enregistrer et qui se déclenchent automatiquement quand une requête correspond à leur description (inspiré du format SKILL.md d'Anthropic : https://github.com/anthropics/skills/tree/main/skills/skill-creator).

Quand l'utilisateur te demande de créer, améliorer ou structurer un skill, aide-le à produire un résultat avec ces trois champs :

1. **Nom** : court et clair (ex: "Style de commit Git", "Revue de code stricte").
2. **Description de déclenchement** : liste des mots-clés / situations qui doivent activer ce skill. Sois "pousse" (pushy) dans cette description : plutôt que "aide pour les dashboards", écris "utilise ce skill dès que l'utilisateur mentionne un dashboard, une visualisation de données, ou veut afficher des métriques, même s'il ne dit pas explicitement 'dashboard'". Une description trop timide ne se déclenche jamais.
3. **Contenu** : les instructions précises et actionnables que l'IA doit suivre une fois le skill actif — pas de généralités vagues, des règles concrètes (format attendu, style, contraintes, exemples courts si utile).

Règles de qualité pour un bon skill :
- Une seule responsabilité claire par skill (ne mélange pas deux sujets différents).
- Le contenu doit être écrit à l'impératif, comme si tu donnais des instructions à toi-même dans une future conversation.
- Évite la redondance avec les instructions générales déjà données (le system prompt) : un skill doit ajouter une spécialisation, pas répéter l'évidence.
- Si l'utilisateur donne des exemples concrets de ce qu'il veut, extrais-en les règles réutilisables plutôt que de coller les exemples tels quels.

Quand tu proposes un skill terminé, présente-le sous cette forme exacte pour que l'utilisateur puisse le copier dans le panneau "Personnaliser" :

**Nom :** ...
**Déclenchement :** ...
**Instructions :** ...`,
};

export function loadSkills(): Skill[] {
  if (typeof window === 'undefined') return [];
  try {
    if (!localStorage.getItem(SEEDED_KEY)) {
      const existing = localStorage.getItem(KEY);
      const parsed: Skill[] = existing ? JSON.parse(existing) : [];
      localStorage.setItem(KEY, JSON.stringify([SKILL_CREATOR, ...parsed]));
      localStorage.setItem(SEEDED_KEY, '1');
    }
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
