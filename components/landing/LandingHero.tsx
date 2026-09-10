'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Layers, ShieldCheck } from 'lucide-react';
import { SignUpButton, useUser } from '@clerk/nextjs';

export function LandingHero() {
  const { isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-border">
      {/* Background Accent Mesh */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Narrative */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center space-x-2 border border-border bg-surface-raised px-3 py-1 text-xs font-mono uppercase tracking-widest text-amber-accent">
              <span className="w-1.5 h-1.5 bg-amber-accent animate-pulse" />
              <span>A Modern Memory Archive</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight text-foreground leading-[1.05]">
              Remember <br />
              <span className="italic font-normal text-amber-accent">every month.</span>
            </h1>

            <p className="font-sans text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              MetaMemoryAlbum turns the photos you take into a living timeline of your life — organized automatically by when the moment actually happened.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              {mounted && isLoaded && isSignedIn ? (
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center space-x-2 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-accent-hover font-semibold transition-all shadow-sm group"
                >
                  <span>Open your archive</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <SignUpButton mode="modal" fallbackRedirectUrl="/app">
                  <button className="inline-flex items-center justify-center space-x-2 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-accent-hover font-semibold transition-all shadow-sm group cursor-pointer">
                    <span>Start your memory album</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </SignUpButton>
              )}

              <Link
                href="/app"
                className="inline-flex items-center justify-center font-mono text-xs uppercase tracking-widest px-6 py-4 border border-border hover:border-amber-accent text-foreground transition-colors"
              >
                Explore the experience
              </Link>
            </div>

            <div className="flex items-center space-x-6 pt-4 text-xs font-mono text-muted-foreground border-t border-border/60">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-accent" />
                <span>Private by default</span>
              </div>
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-accent" />
                <span>Auto EXIF chronology</span>
              </div>
            </div>
          </div>

          {/* Right Chronological Live Stack Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative border border-border bg-surface-raised p-4 sm:p-6 shadow-2xl">
              {/* Year Marker */}
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <span className="font-display text-2xl font-medium text-amber-accent">2026</span>
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                  Living Archive Stream
                </span>
              </div>

              {/* Month Card 1: August 2026 */}
              <div className="border border-border bg-surface p-4 mb-4 hover:border-amber-accent transition-colors">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-display text-xl text-foreground font-medium">August</h3>
                  <span className="font-mono text-[11px] text-muted-foreground">42 memories • 17 days</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative aspect-[4/3] overflow-hidden border border-border-subtle">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                      alt="Dolomites"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden border border-border-subtle">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80"
                      alt="Lake Como"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden border border-border-subtle">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=400&q=80"
                      alt="Cinque Terre"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Month Card 2: July 2026 */}
              <div className="border border-border bg-surface p-4 hover:border-amber-accent transition-colors">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-display text-xl text-foreground font-medium">July</h3>
                  <span className="font-mono text-[11px] text-muted-foreground">38 memories • 14 days</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative aspect-[4/3] overflow-hidden border border-border-subtle">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=400&q=80"
                      alt="Lofoten"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden border border-border-subtle">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
                      alt="Beach"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden border border-border-subtle bg-surface-container flex items-center justify-center font-mono text-xs text-amber-accent">
                    +36 more
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
