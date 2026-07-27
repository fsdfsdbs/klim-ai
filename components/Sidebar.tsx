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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  panel: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 4v16" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  plus: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 12c0 4-3.8 7-8.5 7-1 0-2-.1-2.9-.4L4 20l1.3-3.6C4.5 15.2 4 13.7 4 12c0-4 3.8-7 8.5-7S20 8 20 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  ),
  folder: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 8h16M4 8v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8M4 8l1.5-3h13L20 8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  ),
  link: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9.5 14.5 14.5 9.5M8 6.5 9.6 4.9a3 3 0 0 1 4.2 4.2L12.4 10.7M16 17.5 14.4 19.1a3 3 0 0 1-4.2-4.2l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),
  code: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 8 4 12l5 4M15 8l5 4-5 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  briefcase: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  sort: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4M17 20l3-3M17 20l-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  dots: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  ),
  download: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chevrons: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M8 10l4-4 4 4M8 14l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function Sidebar({ onNewChat, onLoadChat, activeId, refreshKey }: Props) {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    setConversations(loadConversations());
  }, [refreshKey]);

  return (
    <aside className="w-[260px] bg-[#161513] flex flex-col text-[#DDD9D0]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <h1 className="font-serif-claude text-xl text-[#F5F5F3]">Klim</h1>
        <div className="flex items-center gap-3 text-[#B5AFA2]">
          <button className="hover:text-white transition">{Icon.search}</button>
          <button className="hover:text-white transition">{Icon.panel}</button>
        </div>
      </div>

      {/* New chat */}
      <div className="px-3 mb-1">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[15px] text-[#EDEAE3] hover:bg-[#232220] transition"
        >
          <span className="w-6 h-6 rounded-full bg-[#3A3733] flex items-center justify-center shrink-0">
            {Icon.plus}
          </span>
          Nouvelle conversation
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5 mb-4">
        <button className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[15px] text-[#B5AFA2] hover:bg-[#232220] hover:text-[#F5F5F3] transition">
          {Icon.chat} Discussions
        </button>
        <button className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[15px] text-[#B5AFA2] hover:bg-[#232220] hover:text-[#F5F5F3] transition">
          {Icon.folder} Projets
        </button>
        <button className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[15px] text-[#B5AFA2] hover:bg-[#232220] hover:text-[#F5F5F3] transition">
          {Icon.link} Artéfacts
        </button>
        <button className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[15px] text-[#B5AFA2] hover:bg-[#232220] hover:text-[#F5F5F3] transition">
          {Icon.code} Code
        </button>
        <button className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[15px] text-[#B5AFA2] hover:bg-[#232220] hover:text-[#F5F5F3] transition">
          {Icon.briefcase} Personnaliser
        </button>
      </nav>

      {/* Récents */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="flex items-center justify-between px-2.5 mb-1.5">
          <p className="text-xs text-[#6E6A62]">Récents</p>
          <button className="text-[#6E6A62] hover:text-[#B5AFA2] transition">{Icon.sort}</button>
        </div>

        {conversations.length === 0 && (
          <p className="text-xs text-[#6E6A62] px-2.5 py-2">Aucune conversation</p>
        )}

        <div className="space-y-0.5">
          {conversations.map((c, i) => (
            <div
              key={c.id}
              className={`group relative flex items-center rounded-lg transition ${
                activeId === c.id ? 'bg-[#232220]' : 'hover:bg-[#1E1D1B]'
              }`}
            >
              <button
                onClick={() => onLoadChat(c)}
                className={`flex-1 text-left pl-2.5 pr-2 py-2 text-sm truncate ${
                  i === 0 ? 'font-medium text-[#F5F5F3]' : 'text-[#B5AFA2]'
                }`}
              >
                {c.title}
              </button>
              <button
                onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                className="opacity-0 group-hover:opacity-100 transition px-2 text-[#8F8F8A] hover:text-white"
              >
                {Icon.dots}
              </button>
              {openMenu === c.id && (
                <div className="absolute right-0 top-9 z-10 bg-[#2A2825] border border-[#3D3934] rounded-lg shadow-xl py-1 w-40">
                  <button
                    onClick={() => {
                      deleteConversation(c.id);
                      setConversations(loadConversations());
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#332F2B] transition"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Profile */}
      <div className="p-3 mt-2">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-8 h-8 rounded-full bg-[#5B5750] flex items-center justify-center text-sm text-white shrink-0">
            K
          </div>
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-sm text-[#F5F5F3] truncate">klim</span>
            <span className="text-xs text-[#6E6A62]">Plan gratuit</span>
          </div>
          <button className="w-8 h-8 rounded-lg border border-[#33302B] flex items-center justify-center text-[#8F8F8A] hover:text-white transition">
            {Icon.download}
          </button>
          <button className="text-[#8F8F8A] hover:text-white transition">{Icon.chevrons}</button>
        </div>
      </div>
    </aside>
  );
}
