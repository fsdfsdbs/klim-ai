export interface SavedConversation {
  id: string;
  title: string;
  messages: any[];
  updatedAt: number;
}

const KEY = 'chat-conversations';

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
  const all = loadConversations().filter((c) => c.id !== conv.id);
  all.unshift(conv);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
}

export function deleteConversation(id: string) {
  const all = loadConversations().filter((c) => c.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}
