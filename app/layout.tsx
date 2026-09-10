import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#F59E0B',
          colorBackground: '#121212',
          colorText: '#EDEDED',
          colorInputBackground: '#1A1A1A',
          colorInputText: '#EDEDED',
          borderRadius: '0.125rem',
        },
      }}
    >
      <html lang="en" className="dark">
        <head>
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="alternate icon" href="/icon.svg" />
          <link rel="apple-touch-icon" href="/icon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen bg-background text-foreground antialiased selection:bg-amber-accent selection:text-deep-charcoal">
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
