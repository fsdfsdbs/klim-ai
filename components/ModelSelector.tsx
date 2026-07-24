'use client';

import { AVAILABLE_MODELS } from '@/lib/groq';

interface Props {
  model: string;
  setModel: (m: string) => void;
}

export default function ModelSelector({ model, setModel }: Props) {
  return (
    <select
      value={model}
      onChange={(e) => setModel(e.target.value)}
      className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
    >
      {AVAILABLE_MODELS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
