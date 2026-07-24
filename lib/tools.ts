import { tool } from 'ai';
import { z } from 'zod';

const PISTON_LANG_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  bash: { language: 'bash', version: '5.2.0' },
};

export const tools = {
  execute_code: tool({
    description:
      "Exécute un extrait de code dans un sandbox et retourne le résultat (stdout/stderr). Utilise ça pour tester ton propre code avant de le donner à l'utilisateur.",
    parameters: z.object({
      language: z
        .enum(['python', 'javascript', 'typescript', 'cpp', 'c', 'java', 'bash'])
        .describe('Le langage du code'),
      code: z.string().describe('Le code source complet à exécuter'),
    }),
    execute: async ({ language, code }) => {
      const conf = PISTON_LANG_MAP[language];
      try {
        const res = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: conf.language,
            version: conf.version,
            files: [{ content: code }],
          }),
        });
        const data = await res.json();
        return {
          stdout: data.run?.stdout ?? '',
          stderr: data.run?.stderr ?? '',
          code_exit: data.run?.code ?? null,
        };
      } catch (e) {
        return { error: "Erreur lors de l'exécution du sandbox." };
      }
    },
  }),

  web_search: tool({
    description:
      "Cherche des informations à jour sur le web. Utilise ça quand tu n'es pas sûr d'un fait, d'une version de librairie, ou d'une actualité récente.",
    parameters: z.object({
      query: z.string().describe('La requête de recherche'),
    }),
    execute: async ({ query }) => {
      if (!process.env.TAVILY_API_KEY) {
        return { error: 'Web search non configuré (TAVILY_API_KEY manquante).' };
      }
      try {
        const res = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query,
            max_results: 5,
          }),
        });
        const data = await res.json();
        return {
          results: (data.results || []).map((r: any) => ({
            title: r.title,
            url: r.url,
            content: r.content,
          })),
        };
      } catch (e) {
        return { error: 'Erreur lors de la recherche web.' };
      }
    },
  }),
};
