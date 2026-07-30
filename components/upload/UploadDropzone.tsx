'use client';

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, Sparkles, Calendar, MapPin, Camera } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { extractPhotoMetadata, getMonthName } from '@/lib/exif';

interface FilePreview {
  file: File;
  previewUrl: string;
  capturedAt?: string;
  year?: number;
  month?: number;
  location?: string;
  camera?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMsg?: string;
}

interface UploadDropzoneProps {
  onUploadSuccess?: () => void;
  onClose?: () => void;
}

export function UploadDropzone({ onUploadSuccess, onClose }: UploadDropzoneProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    const newPreviews: FilePreview[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|heic|avif)$/i)) {
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const preview: FilePreview = {
        file,
        previewUrl,
        status: 'pending',
      };

      try {
        const buffer = await file.arrayBuffer();
        const meta = await extractPhotoMetadata(buffer, file.lastModified);
        preview.capturedAt = meta.captured_at;
        preview.year = meta.year;
        preview.month = meta.month;
        preview.camera = meta.camera_model;
        if (meta.latitude && meta.longitude) {
          preview.location = `${meta.latitude.toFixed(2)}°, ${meta.longitude.toFixed(2)}°`;
        }
      } catch (e) {
        console.warn('Could not extract preview EXIF:', e);
      }

      newPreviews.push(preview);
    }

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleUploadAll = async () => {
    if (previews.length === 0 || isUploading) return;
    setIsUploading(true);

    const formData = new FormData();
    previews.forEach((p) => {
      formData.append('files', p.file);
    });

    try {
      setPreviews((prev) => prev.map((p) => ({ ...p, status: 'uploading' })));

      const res = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      setPreviews((prev) => prev.map((p) => ({ ...p, status: 'success' })));

      toast({
        title: 'Memories Organized',
        description: `Successfully ingested ${data.count} memory photograph${data.count > 1 ? 's' : ''} into chronological archives.`,
        type: 'success',
      });

      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess();
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setPreviews((prev) => prev.map((p) => ({ ...p, status: 'error', errorMsg: 'Failed to upload' })));
      toast({
        title: 'Upload Error',
        description: 'Failed to upload some photographs. Please try again.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-amber-accent bg-surface-raised/80'
            : 'border-border hover:border-amber-accent/70 bg-surface-raised/30'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,.heic"
          className="hidden"
        />
        <div className="w-12 h-12 border border-border bg-surface text-amber-accent mx-auto mb-4 flex items-center justify-center">
          <Upload className="w-5 h-5" />
        </div>
        <h4 className="font-display text-xl text-foreground font-medium mb-1">
          Add photographs to your archive
        </h4>
        <p className="font-sans text-xs text-muted-foreground max-w-sm mx-auto mb-4">
          Drop your photos here. We automatically read the original camera timestamp and sort them into months and years.
        </p>
        <span className="inline-block font-mono text-[11px] uppercase tracking-wider text-amber-accent border border-border px-3 py-1">
          Select from device
        </span>
      </div>

      {/* File Previews & EXIF Detection Details */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {previews.length} File{previews.length > 1 ? 's' : ''} Ready for Ingestion
            </span>
            <button
              onClick={() => setPreviews([])}
              className="font-mono text-[11px] text-muted-foreground hover:text-danger uppercase tracking-wider transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {previews.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border border-border bg-surface-raised/60 text-xs"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-12 h-12 relative shrink-0 border border-border overflow-hidden bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate">
                    <p className="font-mono font-medium text-foreground truncate">{item.file.name}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-muted-foreground mt-0.5 font-mono">
                      {item.month && item.year ? (
                        <span className="flex items-center text-amber-accent">
                          <Calendar className="w-3 h-3 mr-1 shrink-0" />
                          {getMonthName(item.month)} {item.year}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Current Timestamp</span>
                      )}
                      {item.camera && (
                        <span className="hidden sm:flex items-center truncate">
                          <Camera className="w-3 h-3 mr-1 shrink-0" />
                          {item.camera}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  {item.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-amber-accent" />}
                  {item.status === 'success' && <CheckCircle2 className="w-4 h-4 text-success" />}
                  {item.status === 'error' && <AlertCircle className="w-4 h-4 text-danger" />}
                  {item.status === 'pending' && (
                    <button
                      onClick={() => removePreview(idx)}
                      className="text-muted-foreground hover:text-danger font-mono text-[10px] uppercase px-2 py-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="font-mono text-xs uppercase tracking-widest px-5 py-2.5 border border-border hover:border-muted-foreground text-foreground transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleUploadAll}
              disabled={isUploading}
              className="inline-flex items-center space-x-2 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-accent-hover transition-colors font-medium disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Ingesting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ingest {previews.length} Memories</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
