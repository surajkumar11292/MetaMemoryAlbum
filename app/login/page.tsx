'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SignIn, SignUp } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="h-screen w-full flex flex-col justify-between bg-background text-foreground selection:bg-amber-accent selection:text-deep-charcoal antialiased px-4 py-3 sm:px-6 relative overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[260px] bg-amber-accent/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-5xl w-full mx-auto relative z-10 shrink-0">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-7 h-7 bg-amber-accent flex items-center justify-center text-deep-charcoal font-serif font-bold text-xs tracking-tighter transition-transform group-hover:scale-105">
            M
          </div>
          <span className="font-display text-lg font-medium text-foreground tracking-tight">
            MetaMemoryAlbum
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-[420px] mx-auto my-auto relative z-10 flex flex-col items-center justify-center shrink-0">
        <div className="w-full flex justify-center mb-2.5">
          <div className="inline-flex rounded-sm p-0.5 bg-surface border border-border">
            <button
              onClick={() => setAuthMode('signin')}
              className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-all ${
                authMode === 'signin'
                  ? 'bg-amber-accent text-deep-charcoal font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-all ${
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
              appearance={{
                elements: {
                  rootBox: 'w-full flex justify-center',
                  card: 'bg-surface-raised border border-border shadow-2xl p-4 sm:p-5 m-0 w-full',
                  headerTitle: 'font-display text-xl text-foreground font-medium',
                  headerSubtitle: 'font-sans text-xs text-muted-foreground',
                  formButtonPrimary:
                    'bg-amber-accent hover:bg-amber-500 text-deep-charcoal font-mono text-xs uppercase tracking-wider font-semibold py-2.5 rounded-none',
                  socialButtonsBlockButton:
                    'bg-surface hover:bg-surface-container border border-border text-foreground font-sans text-xs py-2 rounded-none',
                  formFieldInput:
                    'bg-surface border border-border text-foreground text-xs py-2 rounded-none focus:border-amber-accent',
                  footer: 'hidden',
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              fallbackRedirectUrl="/app"
              signInUrl="#signin"
              appearance={{
                elements: {
                  rootBox: 'w-full flex justify-center',
                  card: 'bg-surface-raised border border-border shadow-2xl p-4 sm:p-5 m-0 w-full',
                  headerTitle: 'font-display text-xl text-foreground font-medium',
                  headerSubtitle: 'font-sans text-xs text-muted-foreground',
                  formButtonPrimary:
                    'bg-amber-accent hover:bg-amber-500 text-deep-charcoal font-mono text-xs uppercase tracking-wider font-semibold py-2.5 rounded-none',
                  socialButtonsBlockButton:
                    'bg-surface hover:bg-surface-container border border-border text-foreground font-sans text-xs py-2 rounded-none',
                  formFieldInput:
                    'bg-surface border border-border text-foreground text-xs py-2 rounded-none focus:border-amber-accent',
                  footer: 'hidden',
                },
              }}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center font-mono text-[10px] text-muted-foreground uppercase tracking-widest relative z-10 shrink-0 py-1">
        Encrypted & Private by default • Zero Tracking
      </footer>
    </div>
  );
}
