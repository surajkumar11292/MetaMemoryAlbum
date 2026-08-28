import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'MetaMemoryAlbum — Your life, remembered month by month',
  description:
    'A modern personal memory archive that turns photographs into living chronological timelines with the signature Flashback lens.',
  openGraph: {
    title: 'MetaMemoryAlbum — Your life, remembered month by month',
    description:
      'A modern personal memory archive that turns photographs into living chronological timelines with the signature Flashback lens.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-amber-accent selection:text-deep-charcoal">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
