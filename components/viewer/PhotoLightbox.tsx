'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  MapPin,
  Camera,
  Info,
  Download,
  Trash2,
  Bookmark,
  Check,
  Edit2,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { Photo } from '@/lib/types';
import { getMonthName } from '@/lib/exif';
import { useToast } from '@/components/ui/Toast';

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
  onPhotoUpdated?: (updated: Photo) => void;
  onPhotoDeleted?: (photoId: string) => void;
}

export function PhotoLightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  onPhotoUpdated,
  onPhotoDeleted,
}: PhotoLightboxProps) {
  const { toast } = useToast();
  const [showInfo, setShowInfo] = useState(true);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionInput, setCaptionInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    if (currentPhoto) {
      setCaptionInput(currentPhoto.caption || '');
      setIsEditingCaption(false);
    }
  }, [currentPhoto]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(photos.length - 1); // loop
    }
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0); // loop
    }
  }, [currentIndex, photos.length, onNavigate]);

  const toggleFavorite = async () => {
    if (!currentPhoto) return;
    const nextState = !currentPhoto.is_favorite;

    try {
      const res = await fetch(`/api/photos/${currentPhoto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: nextState }),
      });
      const data = await res.json();
      if (data.success && onPhotoUpdated) {
        onPhotoUpdated(data.photo);
        toast({
          title: nextState ? 'Added to Favorites' : 'Removed from Favorites',
          type: 'success',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetCover = async () => {
    if (!currentPhoto) return;
    try {
      const res = await fetch(`/api/memories/${currentPhoto.year}/${currentPhoto.month}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_photo_id: currentPhoto.id }),
      });
      if (res.ok) {
        toast({
          title: 'Cover Photo Updated',
          description: `Set this photograph as the featured cover for ${getMonthName(currentPhoto.month)} ${currentPhoto.year}.`,
          type: 'success',
        });
      }
    } catch (err) {
      toast({ title: 'Failed to set cover', type: 'error' });
    }
  };

  const handleSaveCaption = async () => {
    if (!currentPhoto) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/photos/${currentPhoto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: captionInput }),
      });
      const data = await res.json();
      if (data.success && onPhotoUpdated) {
        onPhotoUpdated(data.photo);
        setIsEditingCaption(false);
        toast({ title: 'Caption Saved', type: 'success' });
      }
    } catch (err) {
      toast({ title: 'Failed to save caption', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPhoto) return;
    if (!confirm('Are you sure you want to remove this photograph from your memory album?')) return;

    try {
      const res = await fetch(`/api/photos/${currentPhoto.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({ title: 'Photo Removed', type: 'info' });
        if (onPhotoDeleted) onPhotoDeleted(currentPhoto.id);
        if (photos.length <= 1) {
          onClose();
        } else {
          handleNext();
        }
      }
    } catch (err) {
      toast({ title: 'Failed to delete photo', type: 'error' });
    }
  };

  const handleDownload = () => {
    if (!currentPhoto) return;
    const link = document.createElement('a');
    link.href = currentPhoto.url;
    link.download = currentPhoto.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keyboard navigation listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingCaption) return; // don't navigate when typing in input

      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
        case 'f':
        case 'F':
          toggleFavorite();
          break;
        case 'i':
        case 'I':
          setShowInfo((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrevious, onClose, isEditingCaption, currentPhoto]);

  if (!isOpen || !currentPhoto) return null;

  const capturedDate = new Date(currentPhoto.captured_at);
  const formattedTime = !isNaN(capturedDate.getTime())
    ? capturedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050505] text-zinc-100 select-none animate-fade-in">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-black/40 backdrop-blur-md z-10">
        <div className="flex items-center space-x-4">
          <span className="font-mono text-xs text-amber-accent tracking-widest uppercase font-medium">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="text-zinc-600 font-mono text-xs">•</span>
          <span className="font-mono text-xs text-zinc-400 truncate max-w-xs sm:max-w-md">
            {currentPhoto.filename}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFavorite}
            className={`p-2 border transition-colors ${
              currentPhoto.is_favorite
                ? 'bg-amber-accent text-deep-charcoal border-amber-accent'
                : 'border-border text-zinc-300 hover:border-amber-accent'
            }`}
            title="Toggle Favorite (F)"
          >
            <Heart className={`w-4 h-4 ${currentPhoto.is_favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleSetCover}
            className="p-2 border border-border text-zinc-300 hover:border-amber-accent transition-colors hidden sm:inline-flex"
            title="Set as Month Cover"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 border border-border text-zinc-300 hover:border-amber-accent transition-colors"
            title="Download Original"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 border transition-colors ${
              showInfo ? 'border-amber-accent text-amber-accent bg-amber-accent/10' : 'border-border text-zinc-300 hover:border-amber-accent'
            }`}
            title="Toggle EXIF Metadata (I)"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2 border border-border text-zinc-400 hover:text-danger hover:border-danger transition-colors hidden sm:inline-flex"
            title="Remove Photo"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 border border-border text-zinc-300 hover:text-white hover:border-white transition-colors ml-2"
            title="Close Viewer (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Arrow Navigation */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/60 border border-border hover:border-amber-accent text-white hover:bg-black transition-all"
          aria-label="Previous photograph"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center Image Canvas */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentPhoto.id}
            src={currentPhoto.url}
            alt={currentPhoto.caption || currentPhoto.filename}
            className="max-h-full max-w-full object-contain shadow-2xl transition-opacity duration-300"
          />
        </div>

        {/* Right Arrow Navigation */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/60 border border-border hover:border-amber-accent text-white hover:bg-black transition-all"
          aria-label="Next photograph"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Right Metadata Sidebar */}
        {showInfo && (
          <aside className="w-80 lg:w-96 border-l border-border bg-[#0d0f0f] p-6 overflow-y-auto shrink-0 flex flex-col justify-between hidden md:flex">
            <div className="space-y-6">
              {/* Header / Caption */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-amber-accent mb-2">
                  Memory Notes
                </h4>
                {isEditingCaption ? (
                  <div className="space-y-2">
                    <textarea
                      value={captionInput}
                      onChange={(e) => setCaptionInput(e.target.value)}
                      placeholder="Add an archival note or memory caption..."
                      className="w-full h-24 p-2.5 bg-black border border-amber-accent text-xs font-sans text-white focus:outline-none resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/ai/caption', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                location: currentPhoto.location_name,
                                camera: currentPhoto.camera_model,
                                monthName: getMonthName(currentPhoto.month),
                                year: currentPhoto.year,
                                day: currentPhoto.day,
                              }),
                            });
                            const data = await res.json();
                            if (data.caption) setCaptionInput(data.caption);
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="font-mono text-[10px] text-amber-accent hover:underline inline-flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Suggestion</span>
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setIsEditingCaption(false)}
                          className="px-3 py-1 font-mono text-[10px] uppercase border border-border text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveCaption}
                          disabled={isSaving}
                          className="px-3 py-1 font-mono text-[10px] uppercase bg-amber-accent text-deep-charcoal font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingCaption(true)}
                    className="p-3 border border-border hover:border-amber-accent bg-black/40 cursor-pointer group transition-colors"
                  >
                    <p className="font-sans text-xs text-zinc-300 leading-relaxed italic">
                      {currentPhoto.caption || 'Click to add an archival note or thought for this moment...'}
                    </p>
                    <div className="mt-2 flex items-center text-[10px] font-mono text-muted-foreground group-hover:text-amber-accent">
                      <Edit2 className="w-3 h-3 mr-1" /> Edit note
                    </div>
                  </div>
                )}
              </div>

              {/* Chronological Coordinates */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3 border-b border-border pb-1">
                  Chronology
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-500">Capture Date</span>
                    <span className="text-amber-accent font-medium">
                      {getMonthName(currentPhoto.month)} {currentPhoto.day}, {currentPhoto.year}
                    </span>
                  </div>
                  {formattedTime && (
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Time</span>
                      <span>{formattedTime}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-500">Day in Archive</span>
                    <span>Day {currentPhoto.day}</span>
                  </div>
                </div>
              </div>

              {/* Spatial Coordinates */}
              {currentPhoto.location_name && (
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3 border-b border-border pb-1">
                    Location
                  </h4>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-start justify-between text-zinc-300">
                      <span className="text-zinc-500">Place</span>
                      <span className="text-right text-white max-w-[180px] font-sans">
                        {currentPhoto.location_name}
                      </span>
                    </div>
                    {currentPhoto.latitude && currentPhoto.longitude && (
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="text-zinc-500">GPS Coordinates</span>
                        <span className="text-zinc-400 text-[11px]">
                          {currentPhoto.latitude.toFixed(4)}°, {currentPhoto.longitude.toFixed(4)}°
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical EXIF Apparatus */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-3 border-b border-border pb-1">
                  EXIF & Apparatus
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  {currentPhoto.camera_model && (
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Camera</span>
                      <span className="text-white">{currentPhoto.camera_model}</span>
                    </div>
                  )}
                  {currentPhoto.lens_model && (
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Lens</span>
                      <span className="text-right truncate max-w-[170px] text-zinc-300">
                        {currentPhoto.lens_model}
                      </span>
                    </div>
                  )}
                  {currentPhoto.focal_length && (
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Focal Length</span>
                      <span>{currentPhoto.focal_length}</span>
                    </div>
                  )}
                  {currentPhoto.exposure_time && (
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Shutter</span>
                      <span>{currentPhoto.exposure_time}</span>
                    </div>
                  )}
                  {currentPhoto.iso && (
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">ISO</span>
                      <span>{currentPhoto.iso}</span>
                    </div>
                  )}
                  {currentPhoto.width && currentPhoto.height && (
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Dimensions</span>
                      <span>{currentPhoto.width} × {currentPhoto.height} px</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-500">File Size</span>
                    <span>{(currentPhoto.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Keyboard Shortcuts Help */}
            <div className="pt-6 border-t border-border mt-6 text-[10px] font-mono text-zinc-500 flex justify-between">
              <span>← / → Navigate</span>
              <span>F Favorite</span>
              <span>ESC Close</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
