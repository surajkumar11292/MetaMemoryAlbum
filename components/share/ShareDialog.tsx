'use client';

import React, { useState } from 'react';
import { X, Share2, Copy, Check, Shield, AlertTriangle, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { getMonthName } from '@/lib/exif';

interface ShareDialogProps {
  year: number;
  month: number;
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string;
  onTokenChanged?: (newToken?: string) => void;
}

export function ShareDialog({
  year,
  month,
  isOpen,
  onClose,
  initialToken,
  onTokenChanged,
}: ShareDialogProps) {
  const { toast } = useToast();
  const [token, setToken] = useState<string | undefined>(initialToken);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const shareUrl = token
    ? typeof window !== 'undefined'
      ? `${window.location.origin}/share/${token}`
      : `/share/${token}`
    : '';

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.link.token);
        if (onTokenChanged) onTokenChanged(data.link.token);
        toast({ title: 'Share link generated', type: 'success' });
      }
    } catch (err) {
      toast({ title: 'Failed to create share link', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast({ title: 'Link copied to clipboard', type: 'success' });
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevoke = async () => {
    if (!token) return;
    if (!confirm('Revoke this share link? Anyone with this URL will immediately lose access.')) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setToken(undefined);
        if (onTokenChanged) onTokenChanged(undefined);
        toast({ title: 'Sharing revoked', type: 'info' });
      }
    } catch (err) {
      toast({ title: 'Failed to revoke link', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface-raised border border-border text-foreground p-6 sm:p-8">
        <div className="flex justify-between items-start border-b border-border pb-4 mb-6">
          <div>
            <span className="font-mono text-xs text-amber-accent uppercase tracking-widest">
              Private Curated Sharing
            </span>
            <h3 className="font-display text-2xl font-medium text-foreground mt-1">
              Share {getMonthName(month)} {year}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground border border-transparent hover:border-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Privacy Note */}
          <div className="flex items-start space-x-3 p-3.5 border border-border bg-surface text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-amber-accent shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Your memories are private by default. Creating a share link gives anyone with the URL view-only access to <strong>only this specific month</strong>. Your other years, profile, and private archives remain hidden.
            </p>
          </div>

          {token ? (
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Shareable Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2.5 bg-surface border border-border font-mono text-xs text-foreground focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center space-x-1.5 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-wider px-4 py-2.5 hover:bg-accent-hover font-medium transition-colors shrink-0"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="font-mono text-xs text-success flex items-center">
                  <span className="w-2 h-2 rounded-full bg-success mr-2" />
                  Link Active
                </span>
                <button
                  onClick={handleRevoke}
                  disabled={isLoading}
                  className="font-mono text-xs uppercase text-muted-foreground hover:text-danger tracking-wider transition-colors disabled:opacity-50"
                >
                  Revoke Link
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <p className="font-sans text-xs text-muted-foreground">
                No active share link exists for this month yet.
              </p>
              <button
                onClick={handleGenerateLink}
                disabled={isLoading}
                className="inline-flex items-center space-x-2 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-accent-hover font-medium transition-colors disabled:opacity-50"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Generating...' : 'Create Private Share Link'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
