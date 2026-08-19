'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AsymmetricGrid } from '@/components/gallery/AsymmetricGrid';
import { PhotoLightbox } from '@/components/viewer/PhotoLightbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonGallery } from '@/components/ui/Skeleton';
import { Photo } from '@/lib/types';
import { Heart, Sparkles } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/photos?favorites=true');
      const data = await res.json();
      setFavorites(data.photos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleSelectPhoto = (_photo: Photo, index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handlePhotoUpdated = (updated: Photo) => {
    if (!updated.is_favorite) {
      setFavorites((prev) => prev.filter((p) => p.id !== updated.id));
    } else {
      setFavorites((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  return (
    <AppShell>
      <div className="space-y-10">
        <div className="border-b border-border pb-6">
          <div className="flex items-center space-x-2 text-amber-accent font-mono text-xs uppercase tracking-widest mb-1.5">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Curated Collection</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-medium text-foreground tracking-tight">
            Favorite Memories
          </h1>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-2">
            {favorites.length} {favorites.length === 1 ? 'starred photograph' : 'starred photographs'} across your archives
          </p>
        </div>

        {loading ? (
          <SkeletonGallery />
        ) : favorites.length > 0 ? (
          <AsymmetricGrid
            photos={favorites}
            onSelectPhoto={handleSelectPhoto}
            groupByDay={false}
          />
        ) : (
          <EmptyState
            title="No favorite memories yet"
            description="Click the heart icon on any photograph to preserve your most cherished moments in this dedicated collection."
            actionText=""
            icon={<Heart className="w-6 h-6 text-amber-accent" />}
          />
        )}
      </div>

      <PhotoLightbox
        photos={favorites}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        onPhotoUpdated={handlePhotoUpdated}
      />
    </AppShell>
  );
}
