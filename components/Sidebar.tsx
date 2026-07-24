'use client';

import { useEffect, useState } from 'react';
import { loadConversations, deleteConversation, SavedConversation } from '@/lib/storage';

interface Props {
  onNewChat: () => void;
  onLoadChat: (conv: SavedConversation) => void;
  activeId: string | null;
  refreshKey: number;
}

export default function Sidebar({ onNewChat, onLoadChat, activeId, refreshKey }: Props) {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);

  useEffect(() => {
    setConversations(loadConversations());
  }, [refreshKey]);

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col p-4">
      <button
        onClick={onNewChat}
        className="bg-gray-700 hover:bg-gray-600 rounded-lg py-2 mb-4 transition"
      >
        + Nouvelle conversation
      </button>
      <div className="flex-1 overflow-y-auto text-sm space-y-1">
        {conversations.length === 0 && (
          <p className="px-2 text-gray-400">Aucune conversation sauvegardée</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer group ${
              activeId === c.id ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
          >
            <span onClick={() => onLoadChat(c)} className="truncate flex-1">
              {c.title}
            </span>
            <button
              onClick={() => {
                deleteConversation(c.id);
                setConversations(loadConversations());
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
