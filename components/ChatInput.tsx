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
      className="bg-[#232220] border border-[#33302B] rounded-[28px] px-3 pt-3 pb-2 shadow-xl focus-within:border-[#454138] transition"
    >
      <textarea
        value={input}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        placeholder="Comment puis-je t'aider ?"
        rows={1}
        className="w-full resize-none bg-transparent focus:outline-none text-[#F5F1EB] placeholder-[#6E6A62] max-h-40 text-[15px] px-2"
      />
      <div className="flex items-center justify-between mt-1 px-1">
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Joindre un fichier (bientôt)"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A8578] hover:bg-[#2E2C29] hover:text-[#F5F1EB] transition"
          >
            +
          </button>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-transparent text-xs text-[#8A8578] hover:text-[#B5AFA2] outline-none cursor-pointer py-1.5 px-2 rounded-full hover:bg-[#2E2C29] transition"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#232220] text-[#F5F1EB]">
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-[#D97757] hover:bg-[#C86A4B] disabled:bg-[#3D3934] disabled:cursor-not-allowed text-white rounded-full w-8 h-8 flex items-center justify-center transition shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </form>
  );
}
