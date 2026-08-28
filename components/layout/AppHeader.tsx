'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Heart,
  History,
  Grid,
  Sliders,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UploadModal } from '@/components/upload/UploadModal';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const navLinks = [
    { href: '/app', label: 'Timeline', icon: Grid },
    { href: '/app/flashback', label: 'Flashback', icon: History },
    { href: '/app/favorites', label: 'Favorites', icon: Heart },
    { href: '/app/search', label: 'Search', icon: Search },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
          {/* Brand Logo Identity */}
          <div className="flex items-center space-x-8">
            <Link href="/app" className="flex items-center space-x-2.5 group">
              <div className="w-7 h-7 bg-amber-accent flex items-center justify-center text-deep-charcoal font-serif font-bold text-sm tracking-tighter transition-transform group-hover:scale-105">
                M
              </div>
              <span className="font-display text-xl font-medium text-foreground tracking-tight group-hover:text-amber-accent transition-colors">
                MetaMemory
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/app' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-mono text-xs uppercase tracking-widest transition-colors duration-200 py-1 border-b-2 ${
                      isActive
                        ? 'text-amber-accent border-amber-accent font-medium'
                        : 'text-muted-foreground border-transparent hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Toolbar */}
          <div className="flex items-center space-x-3">
            {/* Quick Ingestion Button (Sharp 0px, no drop shadow per design system) */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center space-x-1.5 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest px-3.5 py-2 hover:bg-accent-hover font-semibold transition-colors"
              title="Add Memories"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Memories</span>
            </button>

            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Profile Settings Link */}
            <Link
              href="/app/settings"
              className={`p-2 border transition-colors ${
                pathname === '/app/settings'
                  ? 'border-amber-accent text-amber-accent bg-amber-accent/10'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-amber-accent'
              }`}
              title="Settings & Storage"
            >
              <Sliders className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Global Ingestion Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
