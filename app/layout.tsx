import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mon Chat AI',
  description: 'Clone de Claude.ai avec Groq',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
