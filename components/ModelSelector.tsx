'use client';

import { AVAILABLE_MODELS } from '@/lib/groq';

interface Props {
  model: string;
  setModel: (m: string) => void;
}

export default function ModelSelector({ model, setModel }: Props) {
  return (
    <div className="inline-flex items-center">
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="
          appearance-none
          bg-[#242422]
          hover:bg-[#2C2C2A]
          text-[#F3F3F1]
          text-sm
          rounded-full
          px-4
          py-2
          pr-10
          border
          border-[#333330]
          outline-none
          transition
          cursor-pointer
        "
      >
        {AVAILABLE_MODELS.map((m) => (
          <option
            key={m.id}
            value={m.id}
            className="bg-[#242422] text-[#F3F3F1]"
          >
            {m.label}
          </option>
        ))}
      </select>

      <svg
        className="-ml-8 w-4 h-4 pointer-events-none text-[#A1A1AA]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
