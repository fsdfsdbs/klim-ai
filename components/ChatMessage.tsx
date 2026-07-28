'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ArtifactCard from './ArtifactCard';

interface Props {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  toolInvocations?: any[];
  parts?: any[];
  experimental_attachments?: { url: string; contentType?: string }[];
  onOpenArtifact: (artifact: { language: string; code: string; siblings?: { language: string; code: string }[] }) => void;
  onEditMessage: (id: string, newContent: string) => void;
  onRegenerate: () => void;
  onContinue: () => void;
  isLast: boolean;
  isTruncated?: boolean;
}

const TOOL_LABELS: Record<string, string> = {
  execute_code: 'Test du code en cours…',
  web_search: 'Recherche web en cours…',
  fetch_github: 'Lecture du dépôt GitHub en cours…',
};

function useThrottledValue<T>(value: T, delay: number): T {
  const [throttled, setThrottled] = useState(value);
  const lastUpdate = useRef(Date.now());
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const now = Date.now();
    const remaining = delay - (now - lastUpdate.current);

    if (remaining <= 0) {
      lastUpdate.current = now;
      setThrottled(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdate.current = Date.now();
        setThrottled(valueRef.current);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttled;
}

function parseSegments(content: string) {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  const segments: { type: 'text' | 'code'; content: string; language?: string }[] = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', content: match[2], language: match[1] || 'text' });
    lastIndex = regex.lastIndex;
  }
  // Reste du contenu après le dernier bloc fermé.
  const rest = content.slice(lastIndex);
  // Gère un bloc de code OUVERT mais pas encore fermé (streaming / réponse tronquée).
  const openFence = rest.match(/```(\w+)?\n([\s\S]*)$/);
  if (openFence) {
    const beforeOpen = rest.slice(0, openFence.index ?? 0);
    if (beforeOpen.length > 0) {
      segments.push({ type: 'text', content: beforeOpen });
    }
    segments.push({ type: 'code', content: openFence[2], language: openFence[1] || 'text' });
  } else if (rest.length > 0) {
    segments.push({ type: 'text', content: rest });
  }
  return segments;
}

function extractPendingTools(toolInvocations: any[] = [], parts: any[] = []) {
  const fromInvocations = (toolInvocations || []).map((t) => ({
    toolName: t.toolName,
    state: t.state,
  }));
  const fromParts = (parts || [])
    .filter((p) => p.type === 'tool-invocation')
    .map((p) => ({
      toolName: p.toolInvocation?.toolName,
      state: p.toolInvocation?.state,
    }));
  const all = [...fromInvocations, ...fromParts];
  const seen = new Set();
  return all.filter((t) => {
    if (!t.toolName || seen.has(t.toolName)) return false;
    seen.add(t.toolName);
    return t.state && t.state !== 'result';
  });
}

export default function ChatMessage({
  id,
  role,
  content,
  reasoning,
  toolInvocations,
  parts,
  experimental_attachments,
  onOpenArtifact,
  onEditMessage,
  onRegenerate,
  onContinue,
  isLast,
  isTruncated,
}: Props) {
  const isUser = role === 'user';
  const [showThinking, setShowThinking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  const displayedContent = useThrottledValue(content, isUser ? 0 : 150);

  const pendingTools = extractPendingTools(toolInvocations, parts);
  const segments = parseSegments(displayedContent || '');

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 group">
        <div className="flex flex-col items-end max-w-[80%]">
          {experimental_attachments && experimental_attachments.length > 0 && (
            <div className="flex gap-2 mb-2">
              {experimental_attachments
                .filter((a) => a.contentType?.startsWith('image/'))
                .map((a, i) => (
                  <img key={i} src={a.url} alt="pièce jointe" className="w-24 h-24 object-cover rounded-lg" />
                ))}
            </div>
          )}

          {isEditing ? (
            <div className="w-full min-w-[280px]">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={3}
                className="w-full bg-[#232220] border border-[#D97757] rounded-xl px-3 py-2 text-sm text-[#F5F1EB] outline-none resize-none"
              />
              <div className="flex justify-end gap-2 mt-1.5">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-[#8A8578] hover:text-[#F5F1EB] px-3 py-1"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    onEditMessage(id, editValue);
                    setIsEditing(false);
                  }}
                  className="text-xs bg-[#D97757] hover:bg-[#C86A4B] text-white rounded-lg px-3 py-1"
                >
                  Envoyer
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-[#2E2C29] text-[#F5F1EB] rounded-2xl px-4 py-2.5 text-[15px]">
                {content}
              </div>
              <button
                onClick={() => {
                  setEditValue(content);
                  setIsEditing(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition text-xs text-[#6E6A62] hover:text-[#D97757] mt-1 px-1"
              >
                ✎ Modifier
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 group">
      {reasoning && (
        <div className="mb-3">
          <button
            onClick={() => setShowThinking((s) => !s)}
            className="flex items-center gap-2 text-sm text-[#8A8578] hover:text-[#D97757] transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97757]" />
            {showThinking ? 'Masquer le raisonnement' : 'Thinking...'}
          </button>
          {showThinking && (
            <div className="mt-2 text-sm text-[#8A8578] border-l-2 border-[#33302B] pl-3 whitespace-pre-wrap">
              {reasoning}
            </div>
          )}
        </div>
      )}

      {pendingTools.map((t, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-sm text-[#8A8578] mb-3 px-4 py-2 bg-[#232220] rounded-xl border border-[#33302B] w-fit"
        >
          <span className="w-2 h-2 rounded-full bg-[#D97757] animate-pulse" />
          {TOOL_LABELS[t.toolName] || `Outil "${t.toolName}" en cours…`}
        </div>
      ))}

      {displayedContent && (
        <>
          <div className="prose-invert text-[#EDEAE3] text-[15px]">
            {segments.map((seg, i) =>
              seg.type === 'text' ? (
                <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
                  {seg.content}
                </ReactMarkdown>
              ) : (
                <ArtifactCard
                  key={i}
                  language={seg.language || 'text'}
                  code={seg.content}
                  onClick={() =>
                    onOpenArtifact({
                      language: seg.language || 'text',
                      code: seg.content,
                      siblings: segments
                        .filter((s) => s.type === 'code')
                        .map((s) => ({ language: s.language || 'text', code: s.content })),
                    })
                  }
                />
              )
            )}
          </div>

          {isLast && isTruncated && (
            <button
              onClick={onContinue}
              className="mt-2 flex items-center gap-1.5 text-xs bg-[#D97757]/10 hover:bg-[#D97757]/20 text-[#D97757] rounded-lg px-3 py-1.5 transition"
            >
              ↳ Continuer la génération
            </button>
          )}

          {isLast && (
            <button
              onClick={onRegenerate}
              className="opacity-0 group-hover:opacity-100 transition text-xs text-[#6E6A62] hover:text-[#D97757] mt-2 ml-2 inline-flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4v5h5M20 20v-5h-5M4.5 9a8 8 0 0 1 14.5-3M19.5 15a8 8 0 0 1-14.5 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Régénérer
            </button>
          )}
        </>
      )}
    </div>
  );
}
