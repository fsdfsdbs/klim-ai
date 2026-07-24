'use client';

interface Props {
  code: string | null;
  onClose: () => void;
}

export default function ArtifactPanel({ code, onClose }: Props) {
  if (!code) return null;

  return (
    <div className="w-1/2 border-l bg-white flex flex-col h-screen">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <span className="font-medium text-sm">Aperçu live</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          ✕
        </button>
      </div>
      <iframe
        srcDoc={code}
        sandbox="allow-scripts"
        className="flex-1 w-full"
        title="artifact-preview"
      />
    </div>
  );
}
