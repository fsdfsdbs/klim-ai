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
    <div className="w-64 bg-[#181613] border-r border-[#3D3934] flex flex-col p-3">
      <button
        onClick={onNewChat}
        className="flex items-center gap-2 bg-[#D97757] hover:bg-[#C86A4B] text-white rounded-xl py-2.5 px-3 mb-4 transition text-sm font-medium"
      >
        + Nouvelle conversation
      </button>
      <div className="flex-1 overflow-y-auto text-sm space-y-0.5">
        {conversations.length === 0 && (
          <p className="px-3 text-[#8A8578] text-xs mt-2">Aucune conversation sauvegardée</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group ${
              activeId === c.id ? 'bg-[#2A2825] text-[#F5F1EB]' : 'hover:bg-[#221F1C] text-[#B5AFA2]'
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
              className="opacity-0 group-hover:opacity-100 text-[#8A8578] hover:text-red-400 ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
