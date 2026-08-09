'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, EyeOff, Link2, ArrowRight } from 'lucide-react';

export function SharingTeaser() {
  return (
    <section className="py-20 md:py-28 border-b border-border bg-surface-raised/30">
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono text-xs text-amber-accent uppercase tracking-widest block">
              Granular Control
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-foreground tracking-tight leading-tight">
              Share a month, <br />
              <span className="italic font-normal">not your whole life.</span>
            </h2>
            <p className="font-sans text-muted-foreground text-sm sm:text-base leading-relaxed">
              When you share a link with friends or family, they see only that specific month&apos;s memories. No sign-up required for them. Your other years, profile, and private photos stay strictly private.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                    Cryptographic Tokenized URLs
                  </h4>
                  <p className="font-sans text-xs text-muted-foreground mt-0.5">
                    Unpredictable random links that you can instantly revoke with one click.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-amber-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                    Zero Cross-Contamination
                  </h4>
                  <p className="font-sans text-xs text-muted-foreground mt-0.5">
                    Shared month visitors never see private navigation, search tools, or other archives.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="border border-border bg-surface p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center space-x-2 font-mono text-xs text-amber-accent uppercase tracking-wider">
                  <Link2 className="w-4 h-4" />
                  <span>Public View Simulator</span>
                </div>
                <span className="font-mono text-[10px] uppercase bg-success/10 text-success border border-success/30 px-2 py-0.5">
                  Guest View
                </span>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-xs text-muted-foreground">URL: /share/august-2026-alps-archive-demo</div>
                <div className="p-4 border border-border bg-surface-raised space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-display text-xl text-foreground font-medium">August 2026</span>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">Shared by Suraj</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-square bg-surface border border-border-subtle overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square bg-surface border border-border-subtle overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square bg-surface border border-border-subtle overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=300&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/share/august-2026-alps-archive-demo"
                className="inline-flex items-center space-x-2 font-mono text-xs text-amber-accent hover:text-foreground uppercase tracking-widest transition-colors"
              >
                <span>View live shared month memory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
