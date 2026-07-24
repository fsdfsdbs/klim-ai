'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  artifact: { language: string; code: string } | null;
  onClose: () => void;
}

export default function ArtifactPanel({ artifact, onClose }: Props) {
  const [tab, setTab] = useState<'code' | 'preview'>(
    artifact?.language === 'html' ? 'preview' : 'code'
  );

  if (!artifact) return null;
  const isHtml = artifact.language === 'html';

  return (
    <div className="w-1/2 border-l border-[#3D3934] bg-[#211F1C] flex flex-col h-screen">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3D3934]">
        <div className="flex gap-1 bg-[#2A2825] rounded-lg p-1">
          <button
            onClick={() => setTab('code')}
            className={`text-xs px-3 py-1.5 rounded-md transition ${
              tab === 'code' ? 'bg-[#D97757] text-white' : 'text-[#8A8578] hover:text-[#F5F1EB]'
            }`}
          >
            Code
          </button>
          {isHtml && (
            <button
              onClick={() => setTab('preview')}
              className={`text-xs px-3 py-1.5 rounded-md transition ${
                tab === 'preview' ? 'bg-[#D97757] text-white' : 'text-[#8A8578] hover:text-[#F5F1EB]'
              }`}
            >
              Aperçu
            </button>
          )}
        </div>
        <button onClick={onClose} className="text-[#8A8578] hover:text-[#F5F1EB]">
          ✕
        </button>
      </div>

      {tab === 'preview' && isHtml ? (
        <iframe
          srcDoc={artifact.code}
          sandbox="allow-scripts"
          className="flex-1 w-full bg-white"
          title="artifact-preview"
        />
      ) : (
        <div className="flex-1 overflow-auto">
          <SyntaxHighlighter
            style={oneDark}
            language={artifact.language}
            customStyle={{ margin: 0, minHeight: '100%', background: 'transparent' }}
          >
            {artifact.code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
