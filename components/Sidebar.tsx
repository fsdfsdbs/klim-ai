'use client';

import { useEffect, useState } from 'react';
import { loadConversations, deleteConversation, SavedConversation } from '@/lib/storage';

interface Props {
  onNewChat: () => void;
  onLoadChat: (conv: SavedConversation) => void;
  activeId: string | null;
  refreshKey: number;
}

export default function Sidebar({
  onNewChat,
  onLoadChat,
  activeId,
  refreshKey,
}: Props) {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);

  useEffect(() => {
    setConversations(loadConversations());
  }, [refreshKey]);

  return (
    <aside className="w-[260px] bg-[#1C1C1A] border-r border-[#2B2B29] flex flex-col">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-xl font-semibold text-[#F5F5F3] tracking-tight">
          Klim
        </h1>
      </div>

      {/* Nouveau chat */}
      <div className="px-3">
        <button
          onClick={onNewChat}
          className="w-full h-11 rounded-xl bg-[#2B2B29] hover:bg-[#343432] text-[#F5F5F3] transition flex items-center gap-3 px-4 text-sm"
        >
          <span className="text-lg leading-none">+</span>
          <span>Nouvelle conversation</span>
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 mt-5">
        {conversations.length === 0 && (
          <p className="text-xs text-[#8F8F8A] px-3">
            Aucune conversation
          </p>
        )}

        <div className="space-y-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center rounded-xl transition ${
                activeId === c.id
                  ? 'bg-[#323230]'
                  : 'hover:bg-[#2A2A28]'
              }`}
            >
              <button
                onClick={() => onLoadChat(c)}
                className="flex-1 text-left px-3 py-2.5 text-sm truncate text-[#F5F5F3]"
              >
                {c.title}
              </button>

              <button
                onClick={() => {
                  deleteConversation(c.id);
                  setConversations(loadConversations());
                }}
                className="opacity-0 group-hover:opacity-100 transition px-3 text-[#8F8F8A] hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#2B2B29] p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#3A3A37] flex items-center justify-center text-sm text-white">
            K
          </div>

          <div className="flex flex-col overflow-hidden">
            <span className="text-sm text-[#F5F5F3] truncate">
              Utilisateur
            </span>
            <span className="text-xs text-[#8F8F8A]">
              Plan gratuit
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
