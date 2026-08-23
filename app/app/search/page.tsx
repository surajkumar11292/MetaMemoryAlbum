'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AsymmetricGrid } from '@/components/gallery/AsymmetricGrid';
import { PhotoLightbox } from '@/components/viewer/PhotoLightbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonGallery } from '@/components/ui/Skeleton';
import { Photo } from '@/lib/types';
import { Search, Sparkles, Filter, X } from 'lucide-react';

const SUGGESTED_TAGS = ['2026', '2025', 'August', 'Alps', 'California', 'Greece', 'Tuscany', 'Leica'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/photos?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectPhoto = (_photo: Photo, index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-10">
        {/* Search Header & Input */}
        <div className="border-b border-border pb-8">
          <div className="flex items-center space-x-2 text-amber-accent font-mono text-xs uppercase tracking-widest mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>Archive Search</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-medium text-foreground tracking-tight">
            Discover Memories
          </h1>

          <div className="mt-6 relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-muted-foreground absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by year, month, place, camera, or note..."
                className="w-full bg-surface-raised border border-border focus:border-amber-accent py-4 pl-12 pr-12 text-sm font-sans text-foreground placeholder-muted-foreground focus:outline-none transition-colors"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center space-x-2 mt-3 overflow-x-auto pb-1">
              <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider shrink-0">
                Suggestions:
              </span>
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground border border-border hover:border-amber-accent px-2.5 py-0.5 bg-surface transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <SkeletonGallery />
        ) : photos.length > 0 ? (
          <div className="space-y-6">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Found {photos.length} matching {photos.length === 1 ? 'memory' : 'memories'}
            </div>
            <AsymmetricGrid
              photos={photos}
              onSelectPhoto={handleSelectPhoto}
              groupByDay={false}
            />
          </div>
        ) : (
          <EmptyState
            title={query ? 'No matching memories found' : 'Type to search your archives'}
            description={
              query
                ? `No photographs matched "${query}". Try searching for a month (e.g. August), a year (e.g. 2026), or a location.`
                : 'Instantly find moments by date, location name, camera apparatus, or keywords in your captions.'
            }
            actionText=""
            icon={<Search className="w-6 h-6 text-amber-accent" />}
          />
        )}
      </div>

      <PhotoLightbox
        photos={photos}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </AppShell>
  );
}
