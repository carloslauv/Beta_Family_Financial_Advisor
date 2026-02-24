import type { Metadata } from 'next';
import './globals.css';
import { IntakeProvider } from '@/lib/intake-store';

export const metadata: Metadata = {
  title: 'The Family Panorama — See Your Full Financial Picture',
  description:
    'An AI-powered financial assessment that shows midlife warriors their complete financial picture — retirement, education, career, aging parents, and monthly life — all in one place.',
  keywords: 'family finances, financial planning, retirement, education savings, midlife financial planning',
  openGraph: {
    title: 'The Family Panorama',
    description: "See your family's full financial picture in 10 minutes.",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <IntakeProvider>{children}</IntakeProvider>
      </body>
    </html>
  );
}
