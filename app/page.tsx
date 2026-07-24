'use client';

import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import Sidebar from '@/components/Sidebar';
import ModelSelector from '@/components/ModelSelector';
import ArtifactPanel from '@/components/ArtifactPanel';
import { saveConversation, SavedConversation } from '@/lib/storage';

export default function Home() {
  const [model, setModel] = useState('openai/gpt-oss-120b');
  const [chatId, setChatId] = useState<string>(() => crypto.randomUUID());
  const [refreshKey, setRefreshKey] = useState(0);
  const [artifact, setArtifact] = useState<{ language: string; code: string } | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    id: chatId,
    body: { model },
    
    // --- CALLBACKS DE DÉBOGAGE ---
    onResponse: (response) => {
      console.log('🟡 [onResponse] Statut HTTP:', response.status, response.statusText);
    },
    onError: (error) => {
      console.error('🔴 [onError] Erreur interceptée par useChat:', error);
    },
    onFinish: (message) => {
      console.log('🟢 [onFinish] Message final reçu:', message);
    }
    // -----------------------------
  });

  useEffect(() => {
    if (messages.length > 0) {
      const title = messages[0]?.content?.slice(0, 40) || 'Nouvelle conversation';
      saveConversation({ id: chatId, title, messages, updatedAt: Date.now() });
      setRefreshKey((k) => k + 1);
    }
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

  return (
    <div className="flex h-screen bg-[#1B1A17]">
      <Sidebar onNewChat={onNewChat} onLoadChat={onLoadChat} activeId={chatId} refreshKey={refreshKey} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#3D3934]">
          <ModelSelector model={model} setModel={setModel} />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto w-full px-6 py-8">
                {messages.length === 0 && (
                  <div className="text-center mt-24">
                    <p className="text-2xl font-medium text-[#F5F1EB]">Comment puis-je t'aider ?</p>
                  </div>
                )}
                {messages.map((m) => (
                  <ChatMessage
                    key={m.id}
                    role={m.role as 'user' | 'assistant'}
                    content={m.content}
                    reasoning={(m as any).reasoning}
                    toolInvocations={(m as any).toolInvocations}
                    onOpenArtifact={setArtifact}
                  />
                ))}
              </div>
            </div>
            <div className="max-w-3xl mx-auto w-full px-6 pb-6">
              <ChatInput
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>

          <ArtifactPanel artifact={artifact} onClose={() => setArtifact(null)} />
        </div>
      </div>
    </div>
  );
}
