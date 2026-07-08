'use client';

import React from 'react';
import { AppHeader } from './AppHeader';
import { MobileNav } from './MobileNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-amber-accent selection:text-deep-charcoal">
      <AppHeader />
      <main className="flex-1 max-w-max-width w-full mx-auto px-margin-mobile md:px-margin-desktop py-8 mb-16 md:mb-8">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
