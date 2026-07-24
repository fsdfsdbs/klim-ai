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
      className="bg-[#2A2825] text-[#F5F1EB] text-sm rounded-lg px-3 py-2 border border-[#3D3934] focus:outline-none focus:border-[#D97757]"
    >
      {AVAILABLE_MODELS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
