'use client';

import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import Sidebar from '@/components/Sidebar';
import ModelSelector from '@/components/ModelSelector';
import ArtifactPanel from '@/components/ArtifactPanel';
import { saveConversation, SavedConversation } from '@/lib/storage';

function extractHtmlArtifact(messages: any[]): string | null {
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  if (!lastAssistant) return null;
  const match = lastAssistant.content.match(/```html\n([\s\S]*?)```/);
  return match ? match[1] : null;
}

export default function Home() {
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [chatId, setChatId] = useState<string>(() => crypto.randomUUID());
  const [refreshKey, setRefreshKey] = useState(0);
  const [showArtifact, setShowArtifact] = useState(true);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    id: chatId,
    body: { model },
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
  };

  const onLoadChat = (conv: SavedConversation) => {
    setChatId(conv.id);
    setMessages(conv.messages);
  };

  const artifactCode = extractHtmlArtifact(messages);

  return (
    <div className="flex h-screen">
      <Sidebar
        onNewChat={onNewChat}
        onLoadChat={onLoadChat}
        activeId={chatId}
        refreshKey={refreshKey}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <ModelSelector model={model} setModel={setModel} />
          {artifactCode && (
            <button
              onClick={() => setShowArtifact((s) => !s)}
              className="text-sm bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"
            >
              {showArtifact ? 'Masquer' : 'Afficher'} l'aperçu
            </button>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-20">
                  Pose-moi une question pour commencer
                </div>
              )}
              {messages.map((m) => (
                <ChatMessage key={m.id} role={m.role as 'user' | 'assistant'} content={m.content} />
              ))}
              {isLoading && <div className="text-gray-400 px-4">L'IA réfléchit...</div>}
            </div>
            <div className="max-w-3xl mx-auto w-full">
              <ChatInput
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>

          {showArtifact && artifactCode && (
            <ArtifactPanel code={artifactCode} onClose={() => setShowArtifact(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
