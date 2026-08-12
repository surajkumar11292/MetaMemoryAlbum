'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (isDemo = false) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_archivist_01' }),
      });
      if (res.ok) {
        router.push('/app');
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground p-6 sm:p-12">
      {/* Header */}
      <div className="flex justify-between items-center max-w-5xl w-full mx-auto">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-amber-accent flex items-center justify-center text-deep-charcoal font-serif font-bold text-sm">
            M
          </div>
          <span className="font-display text-xl font-medium text-foreground tracking-tight">
            MetaMemoryAlbum
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Center Auth Container */}
      <div className="w-full max-w-md mx-auto my-12 border border-border bg-surface-raised p-8 sm:p-10 shadow-2xl">
        <div className="text-center space-y-2 mb-8">
          <div className="w-10 h-10 border border-border bg-surface text-amber-accent flex items-center justify-center mx-auto mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-amber-accent font-medium">
            Secure Entry
          </span>
          <h2 className="font-display text-3xl font-medium text-foreground">
            Access Your Archive
          </h2>
          <p className="font-sans text-xs text-muted-foreground max-w-xs mx-auto">
            Your life, chronologically preserved. Sign in to view and curate your memory vaults.
          </p>
        </div>

        <div className="space-y-4">
          {/* Google Sign-In */}
          <button
            onClick={() => handleSignIn(false)}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 bg-surface hover:bg-surface-container border border-border hover:border-amber-accent text-foreground font-mono text-xs uppercase tracking-widest py-3.5 px-4 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-accent" />
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Quick Demo Access */}
          <button
            onClick={() => handleSignIn(true)}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest py-3.5 px-4 font-semibold hover:bg-accent-hover transition-all disabled:opacity-50"
          >
            <span>Enter Demo Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Privacy Note */}
        <p className="font-mono text-[10px] text-muted-foreground text-center mt-6 pt-6 border-t border-border">
          Your memories are encrypted and private by default. No social feeds. No advertising trackers.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center font-mono text-xs text-muted-foreground">
        © {new Date().getFullYear()} MetaMemoryAlbum
      </div>
    </div>
  );
}
