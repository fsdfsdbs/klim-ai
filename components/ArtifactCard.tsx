'use client';

interface Props {
  language: string;
  code: string;
  onClick: () => void;
}

function guessFilename(language: string): string {
  const map: Record<string, string> = {
    html: 'index.html',
    javascript: 'script.js',
    typescript: 'script.ts',
    python: 'script.py',
    cpp: 'main.cpp',
    c: 'main.c',
    java: 'Main.java',
    bash: 'script.sh',
    css: 'style.css',
    json: 'data.json',
    lua: 'script.lua',
  };
  return map[language] || `fichier.${language || 'txt'}`;
}

export default function ArtifactCard({ language, code, onClick }: Props) {
  const lines = code.trim().split('\n').length;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full max-w-sm bg-[#2A2825] hover:bg-[#332F2B] border border-[#3D3934] rounded-xl px-4 py-3 my-2 text-left transition group"
    >
      <div className="w-9 h-9 rounded-lg bg-[#D97757]/15 flex items-center justify-center text-[#D97757] shrink-0">
        {'</>'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#F5F1EB] truncate">{guessFilename(language)}</p>
        <p className="text-xs text-[#8A8578]">{lines} lignes · cliquer pour ouvrir</p>
      </div>
      <span className="text-[#8A8578] group-hover:text-[#F5F1EB] transition shrink-0">→</span>
    </button>
  );
}
