'use client';

interface Props {
  onNewChat: () => void;
}

export default function Sidebar({ onNewChat }: Props) {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col p-4">
      <button
        onClick={onNewChat}
        className="bg-gray-700 hover:bg-gray-600 rounded-lg py-2 mb-4 transition"
      >
        + Nouvelle conversation
      </button>
      <div className="flex-1 overflow-y-auto text-sm text-gray-400">
        <p className="px-2">Aucune conversation sauvegardée</p>
      </div>
    </div>
  );
}
