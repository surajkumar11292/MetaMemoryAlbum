'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AsymmetricGrid } from '@/components/gallery/AsymmetricGrid';
import { PhotoLightbox } from '@/components/viewer/PhotoLightbox';
import { SkeletonGallery } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MonthSummary, Photo } from '@/lib/types';
import { ShieldCheck, Calendar, ArrowRight, Lock } from 'lucide-react';

export default function SharedMonthPage() {
  const params = useParams();
  const token = params.token as string;

  const [monthData, setMonthData] = useState<MonthSummary | null>(null);
  const [ownerName, setOwnerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    async function loadSharedMonth() {
      setLoading(true);
      try {
        const res = await fetch(`/api/share?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          throw new Error('Shared memory not found or link has been revoked');
        }
        const data = await res.json();
        setMonthData(data.month);
        setOwnerName(data.ownerName);
      } catch (err: any) {
        setError(err.message || 'Failed to load shared memory');
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      loadSharedMonth();
    }
  }, [token]);

  const handleSelectPhoto = (_photo: Photo, index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-amber-accent selection:text-deep-charcoal">
      {/* Standalone Shared Header */}
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
              href="/"
              className="inline-flex items-center space-x-1.5 font-mono text-xs uppercase tracking-wider text-amber-accent hover:text-foreground transition-colors"
            >
              <span>Create your album</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-max-width w-full mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {loading ? (
          <div className="space-y-8">
            <div className="h-10 w-64 bg-surface-container animate-pulse" />
            <SkeletonGallery />
          </div>
        ) : error || !monthData ? (
          <div className="text-center py-24 max-w-md mx-auto border border-dashed border-border p-8 bg-surface-raised/40">
            <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-display text-2xl font-medium text-foreground mb-2">
              Memory Not Available
            </h2>
            <p className="font-sans text-xs text-muted-foreground mb-6">
              {error || 'This shared memory link has expired or has been revoked by the owner.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest px-6 py-2.5 font-medium"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Title & Metadata Banner */}
            <div className="border-b border-border pb-8">
              <div className="flex items-center space-x-2 text-amber-accent font-mono text-xs uppercase tracking-widest mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Shared Memory Album • Preserved by {ownerName}</span>
              </div>
              <h1 className="font-display text-5xl sm:text-6xl font-medium text-foreground tracking-tight">
                {monthData.month_name} {monthData.year}
              </h1>
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-3">
                {monthData.photo_count} {monthData.photo_count === 1 ? 'memory' : 'memories'} captured across {monthData.days_captured} {monthData.days_captured === 1 ? 'day' : 'days'}
              </p>
            </div>

            {/* Gallery */}
            <AsymmetricGrid
              photos={monthData.photos}
              onSelectPhoto={handleSelectPhoto}
              groupByDay={true}
            />

            {/* Bottom Callout */}
            <div className="border border-border bg-surface-raised p-8 text-center max-w-2xl mx-auto my-16 space-y-4">
              <h3 className="font-display text-2xl font-medium text-foreground">
                Your memories deserve a living archive.
              </h3>
              <p className="font-sans text-xs text-muted-foreground max-w-md mx-auto">
                MetaMemoryAlbum organizes photos automatically by their original capture date, with zero folders and the signature Flashback lens.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-accent-hover font-semibold transition-colors"
              >
                <span>Start your memory album</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox */}
      {monthData && (
        <PhotoLightbox
          photos={monthData.photos}
          currentIndex={lightboxIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-surface-raised/40 text-center font-mono text-xs text-muted-foreground">
        Shared with MetaMemoryAlbum • Private by default
      </footer>
    </div>
  );
}
