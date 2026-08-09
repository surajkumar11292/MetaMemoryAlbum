'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';

export function TimelineDemo() {
  return (
    <section className="py-20 md:py-28 border-b border-border bg-surface-raised/30">
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-xs text-amber-accent uppercase tracking-widest block mb-2">
            Chronological Discovery
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-medium text-foreground tracking-tight">
            Your life, organized naturally.
          </h2>
          <p className="font-sans text-muted-foreground text-sm sm:text-base mt-4 leading-relaxed">
            Every photo finds its place by month and year, derived from the exact second the shutter clicked. No manual sorting or tedious folder management required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="border border-border bg-surface p-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs text-amber-accent font-semibold">01 / INGEST</span>
              <h3 className="font-display text-2xl font-medium text-foreground mt-2 mb-3">
                Drop your photographs
              </h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                Import whole years or single days from your camera, phone, or laptop. We parse original EXIF timestamps instantly on the device.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-border font-mono text-[11px] text-zinc-400">
              Preserves RAW & high-res fidelity
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-border bg-surface p-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs text-amber-accent font-semibold">02 / ARCHIVE</span>
              <h3 className="font-display text-2xl font-medium text-foreground mt-2 mb-3">
                Auto-sort into months
              </h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                Photos are placed automatically into monthly memory vaults, creating a beautiful continuous stream spanning across decades.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-border font-mono text-[11px] text-zinc-400">
              User → Year → Month hierarchy
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-border bg-surface p-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs text-amber-accent font-semibold">03 / REDISCOVER</span>
              <h3 className="font-display text-2xl font-medium text-foreground mt-2 mb-3">
                Revisit & flashback
              </h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                Step back into a particular season or compare how you celebrated the same month over 3, 5, or 10 years.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-border font-mono text-[11px] text-zinc-400">
              The signature Flashback lens
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
