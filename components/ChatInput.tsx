'use client';

import { useRef, useState } from 'react';
import { AVAILABLE_MODELS } from '@/lib/groq';

interface Props {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent, options?: any) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [previews, setPreviews] = useState<string[]>([]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(e as any);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    setFiles(selected);
    setPreviews(Array.from(selected).map((f) => URL.createObjectURL(f)));
  };

  const removePreview = () => {
    setFiles(undefined);
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = (e: React.FormEvent) => {
    handleSubmit(e, files && files.length > 0 ? { experimental_attachments: files } : undefined);
    removePreview();
  };

  return (
    <form
      onSubmit={submit}
      className="bg-[#232220] border border-[#33302B] rounded-[28px] px-3 pt-3 pb-2 shadow-xl focus-within:border-[#454138] transition"
    >
      {previews.length > 0 && (
        <div className="flex gap-2 px-2 pb-2">
          {previews.map((src, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#3D3934]">
              <img src={src} alt="aperçu" className="w-full h-full object-cover" />
            </div>
          ))}
          <button
            type="button"
            onClick={removePreview}
            className="text-xs text-[#8A8578] hover:text-red-400 self-center px-2"
          >
            Retirer
          </button>
        </div>
      )}

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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
            className="hidden"
          />
          <button
            type="button"
            title="Joindre une image"
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A8578] hover:bg-[#2E2C29] hover:text-[#F5F1EB] transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M21 15l-5-5-11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
