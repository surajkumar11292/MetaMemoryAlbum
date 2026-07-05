'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid, History, Heart, Search, Sliders } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const items = [
    { href: '/app', label: 'Timeline', icon: Grid },
    { href: '/app/flashback', label: 'Flashback', icon: History },
    { href: '/app/favorites', label: 'Favorites', icon: Heart },
    { href: '/app/search', label: 'Search', icon: Search },
    { href: '/app/settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-2 py-2 flex justify-around items-center">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-3 transition-colors ${
              isActive ? 'text-amber-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4 mb-1" />
            <span className="font-mono text-[10px] uppercase tracking-wider">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
