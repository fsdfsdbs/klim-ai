'use client';

import { useState, Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ArtifactCard from './ArtifactCard';

interface ToolInvocation {
  toolName: string;
  state: 'call' | 'result' | 'partial-call';
}

interface Props {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  toolInvocations?: ToolInvocation[];
  onOpenArtifact: (artifact: { language: string; code: string }) => void;
}

const TOOL_LABELS: Record<string, string> = {
  execute_code: 'Test du code en cours…',
  web_search: 'Recherche web en cours…',
};

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
  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) });
  }
  return segments;
}

export default function ChatMessage({ role, content, reasoning, toolInvocations, onOpenArtifact }: Props) {
  const isUser = role === 'user';
  const [showThinking, setShowThinking] = useState(false);
  const pendingTools = (toolInvocations || []).filter((t) => t.state !== 'result');
  const segments = parseSegments(content || '');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[85%] ${isUser ? '' : 'w-full'}`}>
        {reasoning && (
          <div className="mb-2">
            <button
              onClick={() => setShowThinking((s) => !s)}
              className="flex items-center gap-2 text-sm text-[#8A8578] hover:text-[#D97757] transition"
            >
              <span className="w-2 h-2 rounded-full bg-[#D97757]" />
              {showThinking ? 'Masquer le raisonnement' : 'Thinking...'}
            </button>
            {showThinking && (
              <div className="mt-2 text-sm text-[#8A8578] border-l-2 border-[#3D3934] pl-3 whitespace-pre-wrap">
                {reasoning}
              </div>
            )}
          </div>
        )}

        {pendingTools.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm text-[#8A8578] mb-2 px-4 py-2 bg-[#2A2825] rounded-xl border border-[#3D3934] w-fit"
          >
            <span className="w-2 h-2 rounded-full bg-[#D97757] animate-pulse" />
            {TOOL_LABELS[t.toolName] || 'Outil en cours…'}
          </div>
        ))}

        {content && (
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser ? 'bg-[#D97757] text-white ml-auto w-fit' : 'text-[#F5F1EB]'
            }`}
          >
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
                  onClick={() => onOpenArtifact({ language: seg.language || 'text', code: seg.content })}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
