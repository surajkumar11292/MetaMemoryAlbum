import React from 'react';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="py-16 border-t border-border bg-surface-raised/40">
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-amber-accent flex items-center justify-center text-deep-charcoal font-serif font-bold text-xs">
            M
          </div>
          <span className="font-display text-lg font-medium text-foreground">
            MetaMemoryAlbum
          </span>
        </div>

        <div className="flex items-center space-x-8 font-mono text-xs text-muted-foreground uppercase tracking-wider">
          <Link href="/app" className="hover:text-amber-accent transition-colors">
            Archive Timeline
          </Link>
          <Link href="/app/flashback" className="hover:text-amber-accent transition-colors">
            Flashback
          </Link>
          <Link href="/login" className="hover:text-amber-accent transition-colors">
            Sign In
          </Link>
        </div>

        <div className="font-mono text-xs text-muted-foreground">
          © {new Date().getFullYear()} MetaMemoryAlbum. Your life, remembered.
        </div>
      </div>
    </footer>
  );
}
