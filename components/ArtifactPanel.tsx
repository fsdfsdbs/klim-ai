'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlock {
  language: string;
  code: string;
}

interface Props {
  artifact: (CodeBlock & { siblings?: CodeBlock[] }) | null;
  onClose: () => void;
}

const RUNNABLE_LANGUAGES = ['python', 'javascript', 'typescript', 'cpp', 'c', 'java', 'bash'];

const PISTON_LANG_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  bash: { language: 'bash', version: '5.2.0' },
};

function buildCombinedHtml(main: CodeBlock, siblings: CodeBlock[] = []): string {
  let html = main.code;
  const css = siblings.find((s) => s.language === 'css')?.code;
  const js = siblings.find((s) => ['javascript', 'js'].includes(s.language))?.code;

  if (css) {
    if (/<link[^>]+\.css[^>]*>/i.test(html)) {
      html = html.replace(/<link[^>]+\.css[^>]*>/i, `<style>\n${css}\n</style>`);
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
    } else {
      html = `<style>\n${css}\n</style>\n${html}`;
    }
  }

  if (js) {
    if (/<script[^>]+src=["'][^"']*\.js["'][^>]*><\/script>/i.test(html)) {
      html = html.replace(
        /<script[^>]+src=["'][^"']*\.js["'][^>]*><\/script>/i,
        `<script>\n${js}\n</script>`
      );
    } else if (html.includes('</body>')) {
      html = html.replace('</body>', `<script>\n${js}\n</script>\n</body>`);
    } else {
      html = `${html}\n<script>\n${js}\n</script>`;
    }
  }

  return html;
}

export default function ArtifactPanel({ artifact, onClose }: Props) {
  const [tab, setTab] = useState<'code' | 'preview' | 'run'>('code');
  const [iframeKey, setIframeKey] = useState(0);
  const [runOutput, setRunOutput] = useState<{ stdout: string; stderr: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTab('code');
    setRunOutput(null);
  }, [artifact?.code]);

  if (!artifact) return null;
  const isHtml = artifact.language === 'html';
  const isRunnable = RUNNABLE_LANGUAGES.includes(artifact.language);
  const combinedHtml = isHtml ? buildCombinedHtml(artifact, artifact.siblings) : '';

  const runCode = async () => {
    setIsRunning(true);
    setRunOutput(null);
    try {
      const conf = PISTON_LANG_MAP[artifact.language];
      if (!conf) {
        setRunOutput({ stdout: '', stderr: `Langage non exécutable : ${artifact.language}.` });
        return;
      }
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: conf.language,
          version: conf.version,
          files: [{ content: artifact.code }],
        }),
      });
      const data = await res.json();
      setRunOutput({
        stdout: data.run?.stdout || '',
        stderr: data.run?.stderr || '',
      });
    } catch {
      setRunOutput({ stdout: '', stderr: "Erreur lors de l'exécution." });
    } finally {
      setIsRunning(false);
    }
  };

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
          {isRunnable && (
            <button
              onClick={() => {
                setTab('run');
                if (!runOutput) runCode();
              }}
              className={`text-xs px-3 py-1.5 rounded-md transition ${
                tab === 'run' ? 'bg-[#D97757] text-white' : 'text-[#8A8578] hover:text-[#F5F1EB]'
              }`}
            >
              Exécuter
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tab === 'preview' && isHtml && (
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="text-[#8A8578] hover:text-[#F5F1EB] text-xs px-2 py-1"
            >
              ↻ Recharger
            </button>
          )}
          {tab === 'run' && isRunnable && (
            <button
              onClick={runCode}
              disabled={isRunning}
              className="text-[#8A8578] hover:text-[#F5F1EB] text-xs px-2 py-1 disabled:opacity-50"
            >
              ↻ Relancer
            </button>
          )}
          <button onClick={onClose} className="text-[#8A8578] hover:text-[#F5F1EB]">
            ✕
          </button>
        </div>
      </div>

      {tab === 'preview' && isHtml && (
        <iframe
          key={iframeKey}
          srcDoc={combinedHtml}
          sandbox="allow-scripts"
          className="flex-1 w-full bg-white"
          title="artifact-preview"
        />
      )}

      {tab === 'run' && isRunnable && (
        <div className="flex-1 overflow-auto p-4 font-mono text-sm">
          {isRunning && <p className="text-[#8A8578]">Exécution en cours…</p>}
          {runOutput && (
            <>
              {runOutput.stdout && (
                <pre className="text-[#EDEAE3] whitespace-pre-wrap mb-3">{runOutput.stdout}</pre>
              )}
              {runOutput.stderr && (
                <pre className="text-red-400 whitespace-pre-wrap">{runOutput.stderr}</pre>
              )}
              {!runOutput.stdout && !runOutput.stderr && (
                <p className="text-[#6E6A62]">Aucune sortie.</p>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'code' && (
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
