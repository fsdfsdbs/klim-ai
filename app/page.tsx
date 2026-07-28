'use client';

import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
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

const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [truncatedIds, setTruncatedIds] = useState<Set<string>>(new Set());

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput, reload, append } =
    useChat({
      api: '/api/chat',
      id: chatId,
      body: { model, skills: loadSkills() },
onError: (error) => {
        setErrorBanner(error.message || 'Une erreur est survenue, réessaie.');
        setMessages((msgs) => {
          const last = msgs[msgs.length - 1];
          if (last?.role === 'assistant' && !last.content?.trim()) {
            return msgs.slice(0, -1);
          }
          return msgs;
        });
      },
onFinish: (message, opts) => {
        setErrorBanner(null);
        setTruncatedIds((prev) => {
          const next = new Set(prev);
          const content = message.content || '';
          // finishReason === 'length' = coupure "propre" détectée par le SDK.
          // Mais une coupure de connexion (timeout, réseau) ne déclenche pas
          // toujours ce finishReason correctement : on détecte aussi les
          // signes évidents d'un contenu manifestement incomplet (bloc de
          // code jamais refermé, ou balise HTML jamais fermée).
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
    if (messages.length === 0) return;

    // Debounce : on n'écrit dans localStorage qu'1 seconde après la dernière
    // modification, pas à chaque token reçu pendant le streaming (sinon ça
    // sature le thread principal et fait freezer/crasher l'onglet).
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
    reload({ body: { model, skills: loadSkills() } });
  };

  const onContinue = () => {
    append(
      {
        role: 'user',
        content:
          "Continue exactement là où tu t'es arrêté, sans rien répéter de ce qui a déjà été écrit, jusqu'à la fin.",
      },
      { body: { model, skills: loadSkills() } }
    );
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
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
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
                  {errorBanner && (
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
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-1.5 px-1 py-2">
                      <span className="w-2 h-2 rounded-full bg-[#D97757] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-[#D97757] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-[#D97757] animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
              <div className="max-w-3xl mx-auto w-full px-6 pb-6">
                <ChatInput
                  input={input}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
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
