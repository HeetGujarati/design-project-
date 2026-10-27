import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../lib/theme';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'AegisDamage AI — Structural Damage Segmentation Platform',
  description:
    'Enterprise structural crack and defect segmentation platform powered by distributed YOLOv8-seg inference fleet and real-time analytical dashboards.',
  keywords: [
    'concrete crack segmentation',
    'structural health monitoring',
    'YOLOv8-seg',
    'damage inspection',
    'infrastructure defect AI',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
