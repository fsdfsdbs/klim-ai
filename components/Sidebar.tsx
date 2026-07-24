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
    <div className="w-64 bg-[#F7F5F2] border-r border-gray-200 flex flex-col p-3">
      <button
        onClick={onNewChat}
        className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl py-2.5 px-3 mb-4 transition text-sm font-medium shadow-sm"
      >
        + Nouvelle conversation
      </button>
      <div className="flex-1 overflow-y-auto text-sm space-y-0.5">
        {conversations.length === 0 && (
          <p className="px-3 text-gray-400 text-xs mt-2">Aucune conversation sauvegardée</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group ${
              activeId === c.id ? 'bg-orange-50 text-orange-900' : 'hover:bg-gray-100 text-gray-700'
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
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
