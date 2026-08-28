'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useToast } from '@/components/ui/Toast';
import { User, HardDrive, Shield, Palette, LogOut, Trash2, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    toast({ title: 'Signed out', type: 'info' });
    router.push('/login');
  };

  const handleResetData = () => {
    if (confirm('Reset your memory archive to the original seed state?')) {
      window.location.reload();
    }
  };

  const storageUsedMb = user ? (user.storage_used_bytes / (1024 * 1024)).toFixed(1) : '48.2';
  const storageLimitMb = 5120; // 5 GB default
  const storagePercent = Math.min(100, (parseFloat(storageUsedMb) / storageLimitMb) * 100);

  return (
    <AppShell>
      <div className="max-w-3xl space-y-10">
        <div className="border-b border-border pb-6">
          <span className="font-mono text-xs text-amber-accent uppercase tracking-widest block mb-1.5">
            System Preferences
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-medium text-foreground tracking-tight">
            Settings & Storage
          </h1>
          <p className="font-sans text-xs sm:text-sm text-muted-foreground mt-2">
            Manage your archival account, storage limits, and security preferences.
          </p>
        </div>

        <div className="space-y-8">
          {/* Account Profile Section */}
          <div className="border border-border bg-surface-raised p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-border pb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <User className="w-4 h-4 text-amber-accent" />
              <span>Archivist Profile</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 border border-amber-accent overflow-hidden bg-surface shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user?.avatar_url || '/avatar.jpg'}
                  alt={user?.name || 'Suraj Kumar'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground font-medium">{user?.name || 'Suraj Kumar'}</h3>
                <p className="font-mono text-xs text-muted-foreground">{user?.email || 'archivist@metamemory.app'}</p>
                <span className="inline-block mt-1 font-mono text-[10px] uppercase text-amber-accent border border-amber-accent/40 px-1.5 py-0.5 bg-amber-accent/10">
                  Pro Archivist Tier
                </span>
              </div>
            </div>
          </div>

          {/* Storage Capacity Section */}
          <div className="border border-border bg-surface-raised p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-border pb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <HardDrive className="w-4 h-4 text-amber-accent" />
              <span>Storage Usage</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs text-foreground">
                <span>{storageUsedMb} MB used</span>
                <span className="text-muted-foreground">5.0 GB total quota</span>
              </div>
              <div className="w-full h-2 bg-surface border border-border overflow-hidden">
                <div
                  className="h-full bg-amber-accent transition-all duration-500"
                  style={{ width: `${Math.max(2, storagePercent)}%` }}
                />
              </div>
              <p className="font-mono text-[11px] text-muted-foreground pt-1">
                Zero lossy re-compression. Original RAW and high-resolution JPEG EXIF metadata preserved.
              </p>
            </div>
          </div>

          {/* Appearance & Interface */}
          <div className="border border-border bg-surface-raised p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-border pb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <Palette className="w-4 h-4 text-amber-accent" />
              <span>Appearance & Aesthetic</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-sans text-sm text-foreground font-medium">Color Palette Mode</h4>
                <p className="font-sans text-xs text-muted-foreground mt-0.5">
                  Toggle between Obsidian Charcoal Dark and Warm Paper Light.
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Privacy & Sharing */}
          <div className="border border-border bg-surface-raised p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-border pb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <Shield className="w-4 h-4 text-amber-accent" />
              <span>Privacy & Security Defaults</span>
            </div>
            <div className="space-y-3 font-sans text-xs text-muted-foreground leading-relaxed">
              <p>• All new photo uploads are set to <strong>Private by default</strong>.</p>
              <p>• Share links use high-entropy random tokens that do not expose your user ID or other albums.</p>
              <p>• No analytics trackers or advertising SDKs are loaded.</p>
            </div>
          </div>

          {/* Session Actions & Danger Zone */}
          <div className="border border-border bg-surface-raised p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-border pb-3 font-mono text-xs uppercase tracking-wider text-danger">
              <Trash2 className="w-4 h-4 text-danger" />
              <span>Session & Data Management</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center space-x-2 font-mono text-xs uppercase tracking-wider px-4 py-2.5 border border-border hover:border-amber-accent text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>

              <button
                onClick={handleResetData}
                className="inline-flex items-center justify-center space-x-2 font-mono text-xs uppercase tracking-wider px-4 py-2.5 border border-danger/40 hover:border-danger text-danger bg-danger/5 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Demo Archive State</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
