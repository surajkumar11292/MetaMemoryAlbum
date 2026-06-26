import React from 'react';
import { clsx } from 'clsx';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-surface-container border border-border-subtle',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonGallery() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
