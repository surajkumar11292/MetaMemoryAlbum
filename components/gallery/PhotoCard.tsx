'use client';

import React, { useState } from 'react';
import { Heart, MapPin, Calendar, Camera } from 'lucide-react';
import { Photo } from '@/lib/types';
import { getMonthName } from '@/lib/exif';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  onToggleFavorite?: (e: React.MouseEvent, photoId: string) => void;
  priority?: boolean;
}

export function PhotoCard({ photo, onClick, onToggleFavorite }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFav, setIsFav] = useState(photo.is_favorite);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isFav;
    setIsFav(nextState);

    if (onToggleFavorite) {
      onToggleFavorite(e, photo.id);
    } else {
      try {
        await fetch(`/api/photos/${photo.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_favorite: nextState }),
        });
      } catch (err) {
        console.error('Failed to toggle favorite:', err);
      }
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer overflow-hidden border border-border bg-surface-raised transition-all duration-300 hover:border-amber-accent"
    >
      <div className="relative w-full overflow-hidden bg-surface-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.thumbnail_url || photo.url}
          alt={photo.caption || photo.filename}
          loading="lazy"
          className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          style={{
            aspectRatio: photo.aspect_ratio ? `${photo.aspect_ratio}` : '1.5',
            maxHeight: '600px',
          }}
        />

        {/* Subtle Top Gradient for Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Favorite Action Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 transition-all duration-200 border ${
            isFav
              ? 'bg-amber-accent text-deep-charcoal border-amber-accent opacity-100'
              : 'bg-black/60 text-white border-white/20 hover:border-amber-accent opacity-0 group-hover:opacity-100'
          }`}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Cover Photo Badge */}
        {photo.is_cover && (
          <div className="absolute top-3 left-3 bg-deep-charcoal/90 border border-amber-accent/80 text-amber-accent font-mono text-[10px] uppercase px-2 py-0.5 tracking-wider">
            Cover
          </div>
        )}

        {/* Bottom Metadata Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-3 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200 text-white">
          {photo.caption && (
            <p className="font-sans text-xs text-white line-clamp-1 mb-1 font-medium drop-shadow-sm">
              {photo.caption}
            </p>
          )}
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1 text-amber-accent" />
              {getMonthName(photo.month)} {photo.day}, {photo.year}
            </span>
            {photo.location_name && (
              <span className="flex items-center truncate max-w-[160px] text-zinc-400">
                <MapPin className="w-3 h-3 mr-1 shrink-0" />
                <span className="truncate">{photo.location_name}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
