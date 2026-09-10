'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SignIn, SignUp } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground selection:bg-amber-accent selection:text-deep-charcoal antialiased p-4 sm:p-8 md:p-12 relative overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-accent/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-5xl w-full mx-auto relative z-10">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 bg-amber-accent flex items-center justify-center text-deep-charcoal font-serif font-bold text-sm tracking-tighter transition-transform group-hover:scale-105">
            M
          </div>
          <span className="font-display text-xl font-medium text-foreground tracking-tight">
            MetaMemoryAlbum
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-[460px] mx-auto my-6 sm:my-8 relative z-10 flex flex-col items-center">
        <div className="w-full flex justify-center mb-4">
          <div className="inline-flex rounded-sm p-1 bg-surface border border-border">
            <button
              onClick={() => setAuthMode('signin')}
              className={`px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                authMode === 'signin'
                  ? 'bg-amber-accent text-deep-charcoal font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                authMode === 'signup'
                  ? 'bg-amber-accent text-deep-charcoal font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center">
          {authMode === 'signin' ? (
            <SignIn
              routing="hash"
              fallbackRedirectUrl="/app"
              signUpUrl="#signup"
            />
          ) : (
            <SignUp
              routing="hash"
              fallbackRedirectUrl="/app"
              signInUrl="#signin"
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center font-mono text-[11px] text-muted-foreground uppercase tracking-widest relative z-10">
        Encrypted & Private by default • Zero Tracking
      </footer>
    </div>
  );
}
