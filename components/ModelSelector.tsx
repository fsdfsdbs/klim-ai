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
      className="bg-gray-50 text-gray-800 text-sm rounded-lg px-3 py-2 border border-gray-200 focus:outline-none focus:border-gray-300"
    >
      {AVAILABLE_MODELS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
