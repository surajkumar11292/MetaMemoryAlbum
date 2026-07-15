'use client';

import React from 'react';
import { Photo } from '@/lib/types';
import { PhotoCard } from './PhotoCard';

interface AsymmetricGridProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo, index: number) => void;
  onToggleFavorite?: (e: React.MouseEvent, photoId: string) => void;
  groupByDay?: boolean;
}

export function AsymmetricGrid({ photos, onSelectPhoto, onToggleFavorite, groupByDay = false }: AsymmetricGridProps) {
  if (!photos || photos.length === 0) {
    return null;
  }

  if (groupByDay) {
    // Group photos by day
    const dayMap = new Map<number, Photo[]>();
    for (const p of photos) {
      if (!dayMap.has(p.day)) {
        dayMap.set(p.day, []);
      }
      dayMap.get(p.day)!.push(p);
    }

    const sortedDays = Array.from(dayMap.keys()).sort((a, b) => b - a);

    return (
      <div className="space-y-12">
        {sortedDays.map((day) => {
          const dayPhotos = dayMap.get(day)!;
          const firstPhoto = dayPhotos[0];
          return (
            <div key={day} className="space-y-4">
              <div className="flex items-center space-x-3 border-b border-border pb-2">
                <span className="font-mono text-xs text-amber-accent font-medium uppercase tracking-widest">
                  Day {String(day).padStart(2, '0')}
                </span>
                <span className="text-border text-xs">•</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {dayPhotos.length} {dayPhotos.length === 1 ? 'memory' : 'memories'}
                </span>
                {firstPhoto.location_name && (
                  <>
                    <span className="text-border text-xs">•</span>
                    <span className="font-mono text-xs text-muted-foreground truncate">
                      {firstPhoto.location_name}
                    </span>
                  </>
                )}
              </div>

              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]">
                {dayPhotos.map((photo) => {
                  const globalIdx = photos.findIndex((p) => p.id === photo.id);
                  return (
                    <div key={photo.id} className="break-inside-avoid mb-6">
                      <PhotoCard
                        photo={photo}
                        onClick={() => onSelectPhoto(photo, globalIdx)}
                        onToggleFavorite={onToggleFavorite}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]">
      {photos.map((photo, idx) => (
        <div key={photo.id} className="break-inside-avoid mb-6">
          <PhotoCard
            photo={photo}
            onClick={() => onSelectPhoto(photo, idx)}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      ))}
    </div>
  );
}
