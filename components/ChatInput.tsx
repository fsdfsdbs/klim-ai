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
      className="flex items-end gap-2 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-gray-300 transition"
    >
      <textarea
        value={input}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        placeholder="Écris ton message..."
        rows={1}
        className="flex-1 resize-none focus:outline-none text-gray-900 placeholder-gray-400 max-h-40"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl w-9 h-9 flex items-center justify-center transition shrink-0"
      >
        ↑
      </button>
    </form>
  );
}
