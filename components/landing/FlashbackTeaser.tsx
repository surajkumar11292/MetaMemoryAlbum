'use client';

import React from 'react';
import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';

export function FlashbackTeaser() {
  const flashbackItems = [
    {
      year: 2026,
      location: 'Dolomites, Italian Alps',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      caption: 'Dawn hike to Tre Cime di Lavaredo',
    },
    {
      year: 2025,
      location: 'Big Sur, California',
      img: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
      caption: 'Pacific fog rolling along Highway 1',
    },
    {
      year: 2024,
      location: 'Santorini, Greece',
      img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80',
      caption: 'Caldera cliffside sunsets',
    },
    {
      year: 2023,
      location: 'Val d\'Orcia, Tuscany',
      img: 'https://images.unsplash.com/photo-1528114039593-4366cc08227d?auto=format&fit=crop&w=600&q=80',
      caption: 'Golden wheat hills and solitary cypress trees',
    },
  ];

  return (
    <section className="py-20 md:py-28 border-b border-border">
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="flex items-center space-x-2 text-amber-accent font-mono text-xs uppercase tracking-widest mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Signature Differentiator</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-foreground tracking-tight">
              See how your life changes.
            </h2>
            <p className="font-sans text-muted-foreground text-sm sm:text-base mt-3 max-w-xl">
              Flash back to the same month across different years. Witness how seasons, landscapes, and relationships evolve.
            </p>
          </div>

          <Link
            href="/app/flashback"
            className="mt-6 md:mt-0 inline-flex items-center space-x-2 font-mono text-xs text-amber-accent hover:text-foreground uppercase tracking-widest transition-colors"
          >
            <span>Try interactive flashback</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4-Year August Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashbackItems.map((item) => (
            <div
              key={item.year}
              className="border border-border bg-surface-raised overflow-hidden flex flex-col justify-between group hover:border-amber-accent transition-all duration-300"
            >
              <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
                <span className="font-display text-2xl font-medium text-amber-accent">
                  August {item.year}
                </span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Archive</span>
              </div>

              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              </div>

              <div className="p-4 space-y-1 bg-surface-raised">
                <p className="font-sans text-xs text-foreground font-medium line-clamp-1">{item.caption}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{item.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
