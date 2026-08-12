import React from 'react';
import Link from 'next/link';
import { LandingHero } from '@/components/landing/LandingHero';
import { TimelineDemo } from '@/components/landing/TimelineDemo';
import { FlashbackTeaser } from '@/components/landing/FlashbackTeaser';
import { SharingTeaser } from '@/components/landing/SharingTeaser';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowRight, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Marketing Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-7 h-7 bg-amber-accent flex items-center justify-center text-deep-charcoal font-serif font-bold text-sm">
              M
            </div>
            <span className="font-display text-xl font-medium text-foreground tracking-tight">
              MetaMemoryAlbum
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center space-x-1.5 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest px-4 py-2 hover:bg-accent-hover font-semibold transition-colors"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <LandingHero />

      {/* Timeline Section */}
      <TimelineDemo />

      {/* Flashback Signature Feature */}
      <FlashbackTeaser />

      {/* Sharing & Privacy Section */}
      <SharingTeaser />

      {/* Final Call to Action */}
      <section className="py-24 border-b border-border bg-surface text-center">
        <div className="max-w-2xl mx-auto px-margin-mobile">
          <span className="font-mono text-xs text-amber-accent uppercase tracking-widest block mb-3">
            Start Your Archive
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-medium text-foreground mb-4">
            Start remembering.
          </h2>
          <p className="font-sans text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed">
            Begin with a single month or your entire life&apos;s photo collection. Your memories belong to you.
          </p>
          <div className="flex justify-center items-center space-x-4">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-accent-hover font-semibold transition-all shadow-md group"
            >
              <span>Create your memory album</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
