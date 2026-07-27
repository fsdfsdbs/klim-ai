'use client';

import { useEffect, useState } from 'react';
import { loadConversations, deleteConversation, SavedConversation } from '@/lib/storage';

interface Props {
  onNewChat: () => void;
  onLoadChat: (conv: SavedConversation) => void;
  activeId: string | null;
  refreshKey: number;
}

const Icon = {
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  chat: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12c0 4.4-4 8-9 8-1.2 0-2.4-.2-3.5-.6L3 21l1.7-4.3C3.6 15.3 3 13.7 3 12c0-4.4 4-8 9-8s9 3.6 9 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  folder: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  spark: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.2a2 2 0 0 1-2 1.8H9.8a2 2 0 0 1-2-1.8L7 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export default function Sidebar({ onNewChat, onLoadChat, activeId, refreshKey }: Props) {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setConversations(loadConversations());
  }, [refreshKey]);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-[260px] bg-[#1C1C1A] border-r border-[#2B2B29] flex flex-col">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-lg font-semibold text-[#F5F5F3] tracking-tight px-1">Klim</h1>
      </div>

      <div className="px-3 mb-3">
        <div className="flex items-center gap-2 bg-[#232220] border border-[#2E2C29] rounded-xl px-3 py-2 text-[#8F8F8A] focus-within:border-[#3D3934] transition">
          {Icon.search}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="bg-transparent text-sm text-[#F5F5F3] placeholder-[#8F8F8A] outline-none flex-1"
          />
        </div>
      </div>

      <div className="px-3 mb-2">
        <button
          onClick={onNewChat}
          className="w-full h-10 rounded-xl bg-[#D97757] hover:bg-[#C86A4B] text-white transition flex items-center gap-2 px-3 text-sm font-medium"
        >
          {Icon.plus}
          Nouvelle conversation
        </button>
      </div>

      <nav className="px-3 mb-4 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#B5AFA2] hover:bg-[#232220] hover:text-[#F5F5F3] transition">
          <span className="text-[#8F8F8A]">{Icon.chat}</span>
          Discussions
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#B5AFA2] hover:bg-[#232220] hover:text-[#F5F5F3] transition">
          <span className="text-[#8F8F8A]">{Icon.folder}</span>
          Projets
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#B5AFA2] hover:bg-[#232220] hover:text-[#F5F5F3] transition">
          <span className="text-[#8F8F8A]">{Icon.spark}</span>
          Artéfacts
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto px-3">
        <p className="text-xs font-medium text-[#6E6A62] px-2 mb-1.5 mt-1">Récents</p>

        {filtered.length === 0 && (
          <p className="text-xs text-[#6E6A62] px-2 py-2">Aucune conversation</p>
        )}

        <div className="space-y-0.5">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center rounded-lg transition ${
                activeId === c.id ? 'bg-[#2A2825]' : 'hover:bg-[#232220]'
              }`}
            >
              <button
                onClick={() => onLoadChat(c)}
                className="flex-1 text-left px-3 py-2 text-sm truncate text-[#DDD9D0]"
              >
                {c.title}
              </button>
              <button
                onClick={() => {
                  deleteConversation(c.id);
                  setConversations(loadConversations());
                }}
                className="opacity-0 group-hover:opacity-100 transition px-2 text-[#6E6A62] hover:text-red-400"
              >
                {Icon.trash}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#2B2B29] p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#3A3A37] flex items-center justify-center text-sm text-white shrink-0">
            K
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm text-[#F5F5F3] truncate">Utilisateur</span>
            <span className="text-xs text-[#6E6A62]">Plan gratuit</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
