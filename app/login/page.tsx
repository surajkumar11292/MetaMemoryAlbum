'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Check,
  KeyRound,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { supabase } from '@/lib/supabase';
import { SEED_USER } from '@/lib/db/seed';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastAuthMethod, setLastAuthMethod] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    // Read last used auth method from localStorage
    try {
      const saved = localStorage.getItem('meta_last_auth_method');
      if (saved) {
        setLastAuthMethod(saved);
      }
    } catch (e) {
      // ignore
    }

    // Listen for OAuth redirects
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        localStorage.setItem('meta_last_auth_method', 'google');
        const googleName =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split('@')[0];
        const googleAvatar =
          session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
        await establishLocalSession(session.user.id, session.user.email || undefined, googleName, googleAvatar);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-border' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8 && /[0-9]/.test(pass)) score += 1;
    if (pass.length >= 10 && /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-danger' };
    if (score === 2) return { score: 2, label: 'Good', color: 'bg-amber-accent' };
    return { score: 3, label: 'Strong', color: 'bg-success' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      localStorage.setItem('meta_last_auth_method', 'google');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize Google authentication');
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!termsAgreed) {
        setErrorMessage('Please agree to the Terms of Service & Privacy Policy.');
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      localStorage.setItem('meta_last_auth_method', 'email');

      if (authMode === 'signin') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          const errText = data.error || 'Invalid email or password.';
          if (
            errText.toLowerCase().includes('invalid login credentials') ||
            errText.toLowerCase().includes('user not found')
          ) {
            setErrorMessage('No existing account found with this email. Switched to "Create Account" for you.');
            setAuthMode('signup');
          } else {
            setErrorMessage(errText);
          }
          setIsLoading(false);
          return;
        }

        setSuccessMessage('Welcome back to your archive! Loading timeline...');
        setTimeout(() => {
          router.push('/app');
        }, 500);
      } else {
        // Sign Up with JWT
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            name: name.trim(),
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          if (data.isAlreadyRegistered) {
            setErrorMessage('This email is already registered. Please sign in with your password.');
            setAuthMode('signin');
          } else {
            setErrorMessage(data.error || 'Failed to create archival account.');
          }
          setIsLoading(false);
          return;
        }

        if (data.requiresEmailConfirmation) {
          setSuccessMessage('Account registered! Please check your email inbox to confirm your registration.');
          setIsLoading(false);
        } else {
          setSuccessMessage('Account registered successfully! Entering your archive...');
          setTimeout(() => {
            router.push('/app');
          }, 600);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setForgotSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset link.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const establishLocalSession = async (
    userId?: string,
    userEmail?: string,
    userName?: string,
    userAvatar?: string
  ) => {
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || `user_${Date.now()}`,
          email: userEmail || 'archivist@metamemory.app',
          name: userName || 'Archivist',
          avatar_url: userAvatar || null,
        }),
      });
      router.push('/app');
    } catch (e) {
      console.error(e);
      router.push('/app');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setIsLoading(true);
    localStorage.setItem('meta_last_auth_method', 'demo');
    await establishLocalSession(
      SEED_USER.id,
      SEED_USER.email,
      SEED_USER.name,
      SEED_USER.avatar_url || '/avatar.jpg'
    );
  };

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
      <main className="w-full max-w-md mx-auto my-6 sm:my-8 relative z-10">
        <div className="border border-border bg-surface-raised/95 backdrop-blur-md p-6 sm:p-10 space-y-6">
          {/* Badge & Title */}
          <div className="text-center space-y-2">
            <div className="w-10 h-10 border border-border bg-surface text-amber-accent flex items-center justify-center mx-auto mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-amber-accent font-semibold block">
              Archival Gate
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-medium text-foreground tracking-tight">
              {authMode === 'signin' ? 'Access Your Archive' : 'Create Your Archive'}
            </h1>
            <p className="font-sans text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Your life, chronologically preserved. Sign in to view and curate your memory vaults.
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`font-mono text-xs uppercase tracking-wider py-2.5 transition-all relative ${
                authMode === 'signin'
                  ? 'bg-surface-raised text-foreground font-semibold border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Sign In</span>
              {lastAuthMethod === 'email' && authMode === 'signin' && (
                <span className="absolute -top-2 right-2 font-mono text-[9px] bg-amber-accent text-deep-charcoal px-1 uppercase font-bold tracking-tighter">
                  Last Used
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`font-mono text-xs uppercase tracking-wider py-2.5 transition-all ${
                authMode === 'signup'
                  ? 'bg-surface-raised text-foreground font-semibold border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error / Success Notifications */}
          {errorMessage && (
            <div className="p-3 bg-danger/10 border border-danger/40 text-danger font-sans text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-success/10 border border-success/40 text-success font-sans text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Full Name field on Sign Up */}
            {authMode === 'signup' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Your Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Suraj Kumar"
                    className="w-full bg-surface border border-border focus:border-amber-accent py-2.5 pl-10 pr-3 text-xs font-sans text-foreground placeholder-muted-foreground/60 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="archivist@metamemory.app"
                  className="w-full bg-surface border border-border focus:border-amber-accent py-2.5 pl-10 pr-3 text-xs font-sans text-foreground placeholder-muted-foreground/60 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                      setForgotSuccess(false);
                    }}
                    className="font-mono text-[10px] text-muted-foreground hover:text-amber-accent uppercase tracking-wider transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface border border-border focus:border-amber-accent py-2.5 pl-10 pr-3 text-xs font-sans text-foreground placeholder-muted-foreground/60 focus:outline-none transition-colors"
                />
              </div>

              {/* Password Strength Indicator on Sign Up */}
              {authMode === 'signup' && password.length > 0 && (
                <div className="pt-1.5 space-y-1">
                  <div className="flex gap-1.5 h-1">
                    <div
                      className={`flex-1 transition-colors ${
                        passwordStrength.score >= 1 ? passwordStrength.color : 'bg-border'
                      }`}
                    />
                    <div
                      className={`flex-1 transition-colors ${
                        passwordStrength.score >= 2 ? passwordStrength.color : 'bg-border'
                      }`}
                    />
                    <div
                      className={`flex-1 transition-colors ${
                        passwordStrength.score >= 3 ? passwordStrength.color : 'bg-border'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                    <span>Password Strength</span>
                    <span className="font-semibold">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Terms & Conditions Checkbox on Sign Up */}
            {authMode === 'signup' && (
              <div className="pt-1">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 border border-border bg-surface accent-amber-500 rounded-none focus:ring-0"
                  />
                  <span className="font-sans text-[11px] text-muted-foreground leading-relaxed">
                    I agree to the{' '}
                    <span className="text-foreground underline">Terms of Archival Service</span> and
                    acknowledge the{' '}
                    <span className="text-foreground underline">Zero-Tracking Privacy Policy</span>.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest py-3 px-4 font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In With Email' : 'Create Archival Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* What you get micro-copy */}
            {authMode === 'signup' && (
              <p className="font-mono text-[10px] text-muted-foreground text-center uppercase tracking-wider pt-1">
                ✓ Free forever &nbsp;•&nbsp; ✓ 5GB archival storage &nbsp;•&nbsp; ✓ Zero compression
              </p>
            )}
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-border w-full" />
            <span className="bg-surface-raised px-3 font-mono text-[10px] uppercase text-muted-foreground shrink-0">
              or continue with
            </span>
          </div>

          {/* Google Sign-In with Smart "Last Used" badge */}
          <div className="relative">
            {lastAuthMethod === 'google' && (
              <div className="mb-1.5 flex items-center justify-center space-x-1 text-amber-accent font-mono text-[10px] uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Last Used Sign-In Method</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-3 bg-surface hover:bg-surface-container text-foreground font-mono text-xs uppercase tracking-wider py-3 px-4 transition-all disabled:opacity-50 ${
                lastAuthMethod === 'google'
                  ? 'border-2 border-amber-accent'
                  : 'border border-border hover:border-amber-accent'
              }`}
            >
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
            </button>
          </div>

          {/* Quick Demo Access */}
          <div className="pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={handleDemoAccess}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-surface hover:bg-surface-container border border-dashed border-border hover:border-amber-accent text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-wider py-3 px-4 transition-colors"
            >
              <span>Explore Suraj's Demo Archive</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-accent" />
            </button>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-raised border border-border max-w-md w-full p-6 space-y-4 relative">
            <div className="flex items-center space-x-2 text-amber-accent font-mono text-xs uppercase tracking-wider">
              <KeyRound className="w-4 h-4" />
              <span>Reset Archival Access</span>
            </div>

            <h3 className="font-display text-2xl text-foreground font-medium">Reset Your Password</h3>
            <p className="font-sans text-xs text-muted-foreground">
              Enter the email address associated with your archive. We will send a secure password reset link.
            </p>

            {forgotSuccess ? (
              <div className="p-4 bg-success/10 border border-success/40 text-success font-sans text-xs space-y-2">
                <div className="flex items-center space-x-2 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Password Reset Email Dispatched</span>
                </div>
                <p className="text-muted-foreground">
                  Check your inbox for <span className="text-foreground">{forgotEmail}</span> and follow the instructions.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="mt-3 w-full font-mono text-xs uppercase py-2 bg-surface border border-border hover:border-amber-accent text-foreground"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="archivist@metamemory.app"
                    className="w-full bg-surface border border-border focus:border-amber-accent py-2.5 px-3 text-xs font-sans text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 font-mono text-xs uppercase py-2.5 border border-border text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetLoading}
                    className="flex-1 font-mono text-xs uppercase py-2.5 bg-amber-accent text-deep-charcoal font-semibold hover:bg-accent-hover"
                  >
                    {isResetLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center font-mono text-[11px] text-muted-foreground uppercase tracking-widest relative z-10">
        Encrypted & Private by default • Zero Tracking
      </footer>
    </div>
  );
}
