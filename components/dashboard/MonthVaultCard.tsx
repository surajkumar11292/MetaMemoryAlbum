'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Share2, Calendar, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MonthSummary } from '@/lib/types';

interface MonthVaultCardProps {
  month: MonthSummary;
  onOpenShare?: (year: number, month: number, token?: string) => void;
}

export function MonthVaultCard({ month, onOpenShare }: MonthVaultCardProps) {
  const cover = month.cover_photo || month.photos[0];
  const previewPhotos = month.photos.slice(0, 4);

  return (
    <div className="group border border-border bg-surface-raised transition-all duration-300 hover:border-amber-accent flex flex-col justify-between overflow-hidden">
      {/* Month Card Header */}
      <div className="p-5 border-b border-border flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-amber-accent tracking-widest uppercase">
              {month.year}
            </span>
            {month.is_shared && (
              <span className="font-mono text-[10px] uppercase bg-amber-accent/10 text-amber-accent border border-amber-accent/40 px-1.5 py-0.2">
                Shared
              </span>
            )}
          </div>
          <h3 className="font-display text-2xl font-medium text-foreground mt-0.5 group-hover:text-amber-accent transition-colors">
            {month.month_name}
          </h3>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {month.photo_count} {month.photo_count === 1 ? 'memory' : 'memories'} • {month.days_captured} {month.days_captured === 1 ? 'day' : 'days'} captured
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenShare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenShare(month.year, month.month, month.share_token);
              }}
              className="p-2 border border-border text-muted-foreground hover:text-foreground hover:border-amber-accent transition-colors"
              title="Share this month"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          <Link
            href={`/app/memories/${month.year}/${String(month.month).padStart(2, '0')}`}
            className="p-2 border border-border text-muted-foreground hover:text-foreground hover:border-amber-accent transition-colors"
            title="Open month archive"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Featured Cover / Preview Mosaic */}
      <Link
        href={`/app/memories/${month.year}/${String(month.month).padStart(2, '0')}`}
        className="relative block h-56 w-full overflow-hidden bg-surface"
      >
        {cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover.thumbnail_url || cover.url}
              alt={`${month.month_name} ${month.year} Cover`}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
            {cover.location_name && (
              <div className="absolute bottom-3 left-3 text-white font-mono text-[11px] bg-black/60 backdrop-blur-sm px-2 py-0.5 border border-white/10">
                {cover.location_name}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ImageIcon className="w-8 h-8 mb-2 stroke-1" />
            <span className="font-mono text-xs uppercase">No Cover</span>
          </div>
        )}
      </Link>

      {/* Bottom Thumbnail Strip */}
      {previewPhotos.length > 1 && (
        <div className="grid grid-cols-4 gap-1 p-2 bg-surface border-t border-border">
          {previewPhotos.map((photo, i) => (
            <Link
              key={photo.id}
              href={`/app/memories/${month.year}/${String(month.month).padStart(2, '0')}`}
              className="relative h-12 overflow-hidden border border-border-subtle bg-surface-container"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnail_url || photo.url}
                alt=""
                className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
