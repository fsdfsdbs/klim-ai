'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ToolInvocation {
  toolName: string;
  state: 'call' | 'result' | 'partial-call';
}

interface Props {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

const TOOL_LABELS: Record<string, string> = {
  execute_code: 'Test du code en cours…',
  web_search: 'Recherche web en cours…',
};

export default function ChatMessage({ role, content, toolInvocations }: Props) {
  const isUser = role === 'user';
  const pendingTools = (toolInvocations || []).filter((t) => t.state !== 'result');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[85%] ${isUser ? '' : 'w-full'}`}>
        {pendingTools.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm text-gray-500 mb-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 w-fit"
          >
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            {TOOL_LABELS[t.toolName] || 'Outil en cours…'}
          </div>
        ))}

        {content && (
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser ? 'bg-orange-500 text-white ml-auto w-fit' : 'text-gray-900'
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" customStyle={{ borderRadius: '12px' }}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
