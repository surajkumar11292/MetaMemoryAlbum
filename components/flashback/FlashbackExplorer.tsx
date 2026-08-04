'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, Calendar, ArrowRight, Sparkles, MapPin, Camera } from 'lucide-react';
import { FlashbackSummary, Photo } from '@/lib/types';
import { getMonthName } from '@/lib/exif';
import { PhotoLightbox } from '@/components/viewer/PhotoLightbox';
import { SkeletonGallery } from '@/components/ui/Skeleton';

const ALL_MONTHS = [
  { num: 1, name: 'January' },
  { num: 2, name: 'February' },
  { num: 3, name: 'March' },
  { num: 4, name: 'April' },
  { num: 5, name: 'May' },
  { num: 6, name: 'June' },
  { num: 7, name: 'July' },
  { num: 8, name: 'August' },
  { num: 9, name: 'September' },
  { num: 10, name: 'October' },
  { num: 11, name: 'November' },
  { num: 12, name: 'December' },
];

export function FlashbackExplorer() {
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // Default to August as iconic sample
  const [flashback, setFlashback] = useState<FlashbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLightboxPhotos, setActiveLightboxPhotos] = useState<Photo[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadFlashback() {
      setLoading(true);
      try {
        const res = await fetch(`/api/flashback?month=${selectedMonth}`);
        const data = await res.json();
        if (isMounted) {
          setFlashback(data.flashback);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFlashback();
    return () => {
      isMounted = false;
    };
  }, [selectedMonth]);

  const handleOpenPhoto = (photos: Photo[], index: number) => {
    setActiveLightboxPhotos(photos);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="border-b border-border pb-8">
        <div className="flex items-center space-x-2 text-amber-accent font-mono text-xs uppercase tracking-widest mb-2">
          <History className="w-3.5 h-3.5" />
          <span>The Flashback Lens</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium text-foreground tracking-tight">
          How life looked in {getMonthName(selectedMonth)}
        </h1>
        <p className="font-sans text-muted-foreground text-sm max-w-2xl mt-3 leading-relaxed">
          Traverse time across multiple years. Compare where you were, what you saw, and who you were with during this exact month over the seasons of your life.
        </p>

        {/* Month Selector Strip */}
        <div className="mt-8 flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
          {ALL_MONTHS.map((m) => {
            const isSelected = selectedMonth === m.num;
            return (
              <button
                key={m.num}
                onClick={() => setSelectedMonth(m.num)}
                className={`px-3.5 py-2 font-mono text-xs uppercase tracking-wider border transition-all duration-200 whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-accent text-deep-charcoal border-amber-accent font-semibold'
                    : 'bg-surface-raised border-border text-muted-foreground hover:text-foreground hover:border-amber-accent/50'
                }`}
              >
                {m.name.substring(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <SkeletonGallery />
      ) : flashback && flashback.years.length > 0 ? (
        <div className="space-y-16">
          {flashback.years.map((group) => (
            <div key={group.year} className="space-y-6">
              {/* Year Banner */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-border pb-3">
                <div className="flex items-baseline space-x-4">
                  <h2 className="font-display text-3xl sm:text-4xl text-amber-accent font-medium">
                    {group.year}
                  </h2>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    {getMonthName(selectedMonth)} • {group.photo_count} {group.photo_count === 1 ? 'memory' : 'memories'}
                  </span>
                </div>
                <Link
                  href={`/app/memories/${group.year}/${String(selectedMonth).padStart(2, '0')}`}
                  className="mt-2 sm:mt-0 font-mono text-xs text-muted-foreground hover:text-amber-accent uppercase tracking-wider inline-flex items-center space-x-1 transition-colors"
                >
                  <span>View full {getMonthName(selectedMonth)} {group.year} album</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Photo Mosaic for this Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.photos.map((photo, pIdx) => (
                  <div
                    key={photo.id}
                    onClick={() => handleOpenPhoto(group.photos, pIdx)}
                    className="group border border-border bg-surface-raised cursor-pointer overflow-hidden transition-all duration-300 hover:border-amber-accent flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbnail_url || photo.url}
                        alt={photo.caption || photo.filename}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="p-3 border-t border-border bg-surface-raised">
                      <p className="font-sans text-xs text-foreground line-clamp-1 mb-1 font-medium">
                        {photo.caption || photo.filename}
                      </p>
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                        <span>Day {photo.day}</span>
                        {photo.location_name && (
                          <span className="truncate max-w-[140px] text-zinc-400">
                            {photo.location_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border bg-surface-raised/40 p-12">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-4 stroke-1" />
          <h3 className="font-display text-2xl text-foreground font-medium mb-2">
            No memories from {getMonthName(selectedMonth)} yet
          </h3>
          <p className="font-sans text-xs text-muted-foreground max-w-sm mx-auto">
            Upload photographs captured during {getMonthName(selectedMonth)} from any year and they will instantly appear here in chronological comparison.
          </p>
        </div>
      )}

      {/* Lightbox */}
      <PhotoLightbox
        photos={activeLightboxPhotos}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
