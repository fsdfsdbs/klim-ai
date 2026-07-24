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
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-white">
      <textarea
        value={input}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        placeholder="Écris ton message... (Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne)"
        rows={1}
        className="flex-1 border rounded-xl px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-5 py-2 rounded-xl disabled:opacity-50"
      >
        Envoyer
      </button>
    </form>
  );
}
