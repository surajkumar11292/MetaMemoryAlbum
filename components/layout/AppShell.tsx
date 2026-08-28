'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { MobileNav } from './MobileNav';
import { Loader2 } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function verifySession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/login');
        }
      } catch (err) {
        setIsAuthenticated(false);
        router.push('/login');
      }
    }

    verifySession();
  }, [router, pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 bg-amber-accent flex items-center justify-center text-deep-charcoal font-serif font-bold text-lg animate-pulse">
            M
          </div>
          <div className="flex items-center space-x-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-accent" />
            <span>Verifying Archival Credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-amber-accent selection:text-deep-charcoal">
      <AppHeader />
      <main className="flex-1 max-w-max-width w-full mx-auto px-margin-mobile md:px-margin-desktop py-8 mb-24 md:mb-8">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
