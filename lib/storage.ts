export interface SavedConversation {
  id: string;
  title: string;
  messages: any[];
  updatedAt: number;
}

const KEY = 'chat-conversations';
const MAX_CONVERSATIONS = 30;

export function loadConversations(): SavedConversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversation(conv: SavedConversation) {
  try {
    const all = loadConversations().filter((c) => c.id !== conv.id);
    all.unshift(conv);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, MAX_CONVERSATIONS)));
  } catch (e) {
    // localStorage plein ou indisponible : on ignore plutôt que de faire planter l'app
    console.warn('Impossible de sauvegarder la conversation:', e);
  }
}

export function deleteConversation(id: string) {
  try {
    const all = loadConversations().filter((c) => c.id !== id);
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Impossible de supprimer la conversation:', e);
  }
}
