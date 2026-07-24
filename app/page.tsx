'use client';

import { useChat } from 'ai/react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
  });

  const onNewChat = () => setMessages([]);

  return (
    <div className="flex h-screen">
      <Sidebar onNewChat={onNewChat} />
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
    </div>
  );
}
