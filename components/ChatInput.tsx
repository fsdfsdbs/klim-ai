'use client';

interface Props {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: Props) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 bg-[#2A2825] border border-[#3D3934] rounded-2xl px-4 py-3 focus-within:border-[#D97757] transition"
    >
      <textarea
        value={input}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        placeholder="Écris ton message..."
        rows={1}
        className="flex-1 resize-none bg-transparent focus:outline-none text-[#F5F1EB] placeholder-[#8A8578] max-h-40"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="bg-[#D97757] hover:bg-[#C86A4B] disabled:bg-[#3D3934] disabled:cursor-not-allowed text-white rounded-xl w-9 h-9 flex items-center justify-center transition shrink-0"
      >
        ↑
      </button>
    </form>
  );
}
