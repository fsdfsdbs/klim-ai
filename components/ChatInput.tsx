'use client';

import { AVAILABLE_MODELS } from '@/lib/groq';

interface Props {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  model: string;
  setModel: (m: string) => void;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  model,
  setModel,
}: Props) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col bg-[#232220] border border-[#33302B] rounded-2xl px-4 pt-3 pb-2 focus-within:border-[#D97757]/50 transition shadow-lg"
    >
      <textarea
        value={input}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        placeholder="Écris ton message..."
        rows={1}
        className="w-full resize-none bg-transparent focus:outline-none text-[#F5F1EB] placeholder-[#6E6A62] max-h-40 text-[15px]"
      />
      <div className="flex items-center justify-between mt-2">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-transparent text-xs text-[#8A8578] hover:text-[#B5AFA2] outline-none cursor-pointer py-1"
        >
          {AVAILABLE_MODELS.map((m) => (
            <option key={m.id} value={m.id} className="bg-[#232220] text-[#F5F1EB]">
              {m.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-[#D97757] hover:bg-[#C86A4B] disabled:bg-[#3D3934] disabled:cursor-not-allowed text-white rounded-xl w-8 h-8 flex items-center justify-center transition shrink-0"
        >
          ↑
        </button>
      </div>
    </form>
  );
}
