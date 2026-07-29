'use client';

import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import Sidebar from '@/components/Sidebar';
import ArtifactPanel from '@/components/ArtifactPanel';
import PersonalizePanel from '@/components/PersonalizePanel';
import { saveConversation, SavedConversation } from '@/lib/storage';
import { loadSkills } from '@/lib/skills';

const SUGGESTIONS = [
  'Écris une fonction Python de tri rapide',
  'Explique-moi les hooks React',
  'Crée une page HTML avec un formulaire',
  'Aide-moi à déboguer mon code',
];

export default function Home() {
  const [model, setModel] = useState('openai/gpt-oss-120b');
  const [chatId, setChatId] = useState<string>(() => crypto.randomUUID());
  const [refreshKey, setRefreshKey] = useState(0);
  const [artifact, setArtifact] = useState<{ language: string; code: string; siblings?: { language: string; code: string }[] } | null>(null);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [truncatedIds, setTruncatedIds] = useState<Set<string>>(new Set());
  const [retryState, setRetryState] = useState<{ attempt: number; secondsLeft: number } | null>(null);

  const retryAttemptRef = useRef(0);
  const reloadRef = useRef<(() => void) | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const retryWithCountdown = () => {
    retryAttemptRef.current += 1;
    const attempt = retryAttemptRef.current;

    if (attempt > 5) {
      setRetryState(null);
      setErrorBanner("Le service est saturé (limite de requêtes atteinte). Réessaie dans quelques minutes.");
      setIsWaitingForResponse(false);
      retryAttemptRef.current = 0;
      return;
    }

    const waitSeconds = Math.min(5 * attempt, 30);
    setErrorBanner(null);
    setRetryState({ attempt, secondsLeft: waitSeconds });
    setIsWaitingForResponse(true);

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    intervalRef.current = setInterval(() => {
      setRetryState((prev) => {
        if (!prev) return prev;
        if (prev.secondsLeft <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return null;
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (reloadRef.current) {
        reloadRef.current();
      } else {
        setIsWaitingForResponse(false);
      }
    }, waitSeconds * 1000);
  };

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput, reload, append } =
    useChat({
      api: '/api/chat',
      id: chatId,
      body: { model, skills: loadSkills() },
      onError: (error) => {
        setIsWaitingForResponse(false);
        const msg = error.message || '';
        const isRateLimit = /rate.?limit|429|too many requests/i.test(msg);

        setMessages((msgs) => {
          const last = msgs[msgs.length - 1];
          if (last?.role === 'assistant' && !last.content?.trim()) {
            return msgs.slice(0, -1);
          }
          return msgs;
        });

        if (isRateLimit) {
          retryWithCountdown();
        } else {
          setErrorBanner(msg || 'Une erreur est survenue, réessaie.');
        }
      },
      onFinish: (message, opts) => {
        setIsWaitingForResponse(false);
        setErrorBanner(null);
        retryAttemptRef.current = 0;
        setTruncatedIds((prev) => {
          const next = new Set(prev);
          const content = message.content || '';
          const openCodeFences = (content.match(/```/g) || []).length % 2 !== 0;
          const looksIncomplete =
            openCodeFences ||
            (content.includes('<html') && !content.includes('</html>'));

          if ((opts as any)?.finishReason === 'length' || looksIncomplete) {
            next.add(message.id);
          } else {
            next.delete(message.id);
          }
          return next;
        });
      },
    });

  useEffect(() => {
    reloadRef.current = () => reload({ body: { model, skills: loadSkills() } });
  }, [reload, model]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const timeout = setTimeout(() => {
      const title = messages[0]?.content?.slice(0, 40) || 'Nouvelle conversation';
      saveConversation({ id: chatId, title, messages, updatedAt: Date.now() });
      setRefreshKey((k) => k + 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [messages, chatId]);

  const onNewChat = () => {
    setChatId(crypto.randomUUID());
    setMessages([]);
    setArtifact(null);
  };

  const onLoadChat = (conv: SavedConversation) => {
    setChatId(conv.id);
    setMessages(conv.messages);
    setArtifact(null);
  };

  const onEditMessage = (id: string, newContent: string) => {
    const index = messages.findIndex((m) => m.id === id);
    if (index === -1) return;
    const updated = messages.slice(0, index + 1);
    updated[index] = { ...updated[index], content: newContent };
    setMessages(updated);
    reload({ body: { model, skills: loadSkills() } });
  };

  const onRegenerate = () => {
    setIsWaitingForResponse(true);
    reload({ body: { model, skills: loadSkills() } });
  };

  const onContinue = () => {
    setIsWaitingForResponse(true);
    reload({ body: { model, skills: loadSkills() } });
    setInput('');
  };

  const customHandleSubmit = (e: React.FormEvent, options?: any) => {
    setIsWaitingForResponse(true);
    handleSubmit(e, options);
  };

  const isEmpty = messages.length === 0;
  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id;

  return (
    <div className="flex h-screen bg-[#1A1917]">
      <Sidebar
        onNewChat={onNewChat}
        onLoadChat={onLoadChat}
        activeId={chatId}
        refreshKey={refreshKey}
        onOpenPersonalize={() => setShowPersonalize(true)}
      />
      {showPersonalize && <PersonalizePanel onClose={() => setShowPersonalize(false)} />}

      <div className="flex-1 flex min-w-0">
        <div className="flex-1 flex flex-col min-w-0">
          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="w-full max-w-2xl">
                <h1 className="font-serif-claude text-4xl text-[#F5F1EB] text-center mb-8">
                  Comment puis-je t'aider ?
                </h1>
                <ChatInput
                  input={input}
                  handleInputChange={handleInputChange}
                  handleSubmit={customHandleSubmit}
                  isLoading={isLoading || isWaitingForResponse}
                  model={model}
                  setModel={setModel}
                />
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-left text-sm text-[#B5AFA2] bg-[#232220] hover:bg-[#2A2825] border border-[#33302B] rounded-xl px-4 py-3 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto w-full px-6 py-8">
                  {retryState && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-[#D97757]/10 border border-[#D97757]/30 rounded-xl text-sm text-[#D97757]">
                      <span className="w-2 h-2 rounded-full bg-[#D97757] animate-pulse" />
                      Trop de requêtes en ce moment — nouvelle tentative dans {retryState.secondsLeft}s (essai {retryState.attempt}/5)…
                    </div>
                  )}
                  {errorBanner && !retryState && (
                    <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                      {errorBanner}
                    </div>
                  )}
                  {messages.map((m) => (
                    <ChatMessage
                      key={m.id}
                      id={m.id}
                      role={m.role as 'user' | 'assistant'}
                      content={m.content}
                      reasoning={(m as any).reasoning}
                      toolInvocations={(m as any).toolInvocations}
                      parts={(m as any).parts}
                      experimental_attachments={(m as any).experimental_attachments}
                      onOpenArtifact={setArtifact}
                      onEditMessage={onEditMessage}
                      onRegenerate={onRegenerate}
                      onContinue={onContinue}
                      isLast={m.id === lastAssistantId}
                      isTruncated={truncatedIds.has(m.id)}
                    />
                  ))}
                  {(isLoading || isWaitingForResponse) && (
                    <div className="flex gap-1.5 px-1 py-2">
                      <span className="w-2 h-2 rounded-full bg-[#D97757] animate-typing-bounce" />
                      <span className="w-2 h-2 rounded-full bg-[#D97757] animate-typing-bounce [animation-delay:-0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-[#D97757] animate-typing-bounce [animation-delay:-0.4s]" />
                    </div>
                  )}
                </div>
              </div>
              <div className="max-w-3xl mx-auto w-full px-6 pb-6">
                <ChatInput
                  input={input}
                  handleInputChange={handleInputChange}
                  handleSubmit={customHandleSubmit}
                  isLoading={isLoading || isWaitingForResponse}
                  model={model}
                  setModel={setModel}
                />
              </div>
            </>
          )}
        </div>

        <ArtifactPanel artifact={artifact} onClose={() => setArtifact(null)} />
      </div>
    </div>
  );
}
