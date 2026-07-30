'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { UploadDropzone } from './UploadDropzone';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-surface-raised border border-border text-foreground p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
          <div>
            <h3 className="font-display text-2xl font-medium text-foreground">Archive Ingestion</h3>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
              Automated Chronological Date Extraction
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground border border-transparent hover:border-border transition-colors"
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <UploadDropzone onUploadSuccess={onUploadSuccess} onClose={onClose} />
      </div>
    </div>
  );
}
