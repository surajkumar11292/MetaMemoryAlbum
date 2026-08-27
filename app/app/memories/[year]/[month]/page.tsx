'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { AsymmetricGrid } from '@/components/gallery/AsymmetricGrid';
import { PhotoLightbox } from '@/components/viewer/PhotoLightbox';
import { ShareDialog } from '@/components/share/ShareDialog';
import { UploadModal } from '@/components/upload/UploadModal';
import { SkeletonGallery } from '@/components/ui/Skeleton';
import { MonthSummary, Photo } from '@/lib/types';
import {
  ArrowLeft,
  Share2,
  Calendar,
  Layers,
  MapPin,
  Camera,
  Plus,
  Grid,
  ListFilter
} from 'lucide-react';

export default function MonthDetailPage() {
  const params = useParams();
  const year = parseInt(params.year as string, 10);
  const monthNum = parseInt(params.month as string, 10);

  const [monthData, setMonthData] = useState<MonthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupByDay, setGroupByDay] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const loadMonthData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/memories/${year}/${monthNum}`);
      if (res.ok) {
        const data = await res.json();
        setMonthData(data.month);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (year && monthNum) {
      loadMonthData();
    }
  }, [year, monthNum]);

  const handleSelectPhoto = (_photo: Photo, index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handlePhotoUpdated = (updated: Photo) => {
    if (!monthData) return;
    setMonthData({
      ...monthData,
      photos: monthData.photos.map((p) => (p.id === updated.id ? updated : p)),
    });
  };

  const handlePhotoDeleted = (photoId: string) => {
    if (!monthData) return;
    const remaining = monthData.photos.filter((p) => p.id !== photoId);
    setMonthData({
      ...monthData,
      photos: remaining,
      photo_count: remaining.length,
    });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-8">
          <div className="h-8 w-40 bg-surface-container animate-pulse" />
          <SkeletonGallery />
        </div>
      </AppShell>
    );
  }

  if (!monthData) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <h2 className="font-display text-3xl mb-4">Month Archive Not Found</h2>
          <Link
            href="/app"
            className="font-mono text-xs uppercase text-amber-accent hover:underline"
          >
            Return to Timeline
          </Link>
        </div>
      </AppShell>
    );
  }

  const cover = monthData.cover_photo || monthData.photos[0];

  return (
    <AppShell>
      <div className="space-y-10">
        {/* Back Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/app"
            className="inline-flex items-center space-x-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Timeline</span>
          </Link>

          <div className="flex items-center space-x-3">
            {/* Group By Day Toggle */}
            <button
              onClick={() => setGroupByDay(!groupByDay)}
              className={`p-2 border font-mono text-xs uppercase tracking-wider inline-flex items-center space-x-1.5 transition-colors ${
                groupByDay
                  ? 'border-amber-accent text-amber-accent bg-amber-accent/10'
                  : 'border-border text-muted-foreground hover:border-amber-accent'
              }`}
              title="Toggle Day Grouping"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Group by Day</span>
            </button>

            {/* Share Month */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 border border-border text-muted-foreground hover:text-foreground hover:border-amber-accent inline-flex items-center space-x-1.5 font-mono text-xs uppercase tracking-wider transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share Month</span>
            </button>

            {/* Ingest into Month */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center space-x-1.5 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-wider px-3.5 py-2 hover:bg-accent-hover font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Photos</span>
            </button>
          </div>
        </div>

        {/* Editorial Month Title & Stats */}
        <div className="border-b border-border pb-8">
          <div className="flex items-center space-x-2 text-amber-accent font-mono text-xs uppercase tracking-widest mb-2">
            <span>{monthData.year} Archive Vault</span>
            {monthData.is_shared && (
              <>
                <span>•</span>
                <span className="text-success">Shared via Private Link</span>
              </>
            )}
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-medium text-foreground tracking-tight">
            {monthData.month_name} {monthData.year}
          </h1>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-3">
            {monthData.photo_count} {monthData.photo_count === 1 ? 'memory' : 'memories'} captured across {monthData.days_captured} {monthData.days_captured === 1 ? 'day' : 'days'}
          </p>
        </div>

        {/* Asymmetric Gallery */}
        <AsymmetricGrid
          photos={monthData.photos}
          onSelectPhoto={handleSelectPhoto}
          groupByDay={groupByDay}
        />
      </div>

      {/* Lightbox Viewer */}
      <PhotoLightbox
        photos={monthData.photos}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        onPhotoUpdated={handlePhotoUpdated}
        onPhotoDeleted={handlePhotoDeleted}
      />

      {/* Share Dialog */}
      <ShareDialog
        year={year}
        month={monthNum}
        isOpen={isShareOpen}
        initialToken={monthData.share_token}
        onClose={() => setIsShareOpen(false)}
        onTokenChanged={() => loadMonthData()}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => loadMonthData()}
      />
    </AppShell>
  );
}
