import React from 'react';
import { Image as ImageIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'Your memories are waiting.',
  description = 'Add your first photos and we’ll turn them into a living timeline of your life, organized automatically by when they were taken.',
  actionText = 'Add memories',
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border bg-surface-raised/40 max-w-xl mx-auto my-12">
      <div className="w-12 h-12 flex items-center justify-center border border-border bg-surface text-amber-accent mb-6">
        {icon || <ImageIcon className="w-6 h-6" />}
      </div>
      <h3 className="font-display text-2xl font-medium text-foreground mb-2">
        {title}
      </h3>
      <p className="font-sans text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 bg-amber-accent text-deep-charcoal font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-accent-hover transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
