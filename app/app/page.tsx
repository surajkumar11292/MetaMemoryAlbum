'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { YearSelector } from '@/components/dashboard/YearSelector';
import { MonthVaultCard } from '@/components/dashboard/MonthVaultCard';
import { ShareDialog } from '@/components/share/ShareDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonGallery } from '@/components/ui/Skeleton';
import { UploadModal } from '@/components/upload/UploadModal';
import { YearSummary, User } from '@/lib/types';
import { Sparkles, Calendar, Layers, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [years, setYears] = useState<YearSummary[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Share Dialog state
  const [shareDialog, setShareDialog] = useState<{
    isOpen: boolean;
    year: number;
    month: number;
    token?: string;
  }>({
    isOpen: false,
    year: 2026,
    month: 8,
  });

  const loadMemories = async (yearFilter: number | 'all' = selectedYear) => {
    setLoading(true);
    try {
      const url = yearFilter === 'all' ? '/api/memories' : `/api/memories?year=${yearFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setYears(data.years || []);
      setAvailableYears(data.availableYears || []);
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories(selectedYear);
  }, [selectedYear]);

  const totalMemories = years.reduce((acc, curr) => acc + curr.total_memories, 0);

  const handleOpenShare = (year: number, month: number, token?: string) => {
    setShareDialog({
      isOpen: true,
      year,
      month,
      token,
    });
  };

  return (
    <AppShell>
      <div className="space-y-10">
        {/* Dashboard Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-accent font-mono text-xs uppercase tracking-widest mb-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Living Chronological Archive</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-medium text-foreground tracking-tight">
              {user?.name ? `${user.name}'s Memory Timeline` : 'Your Memory Timeline'}
            </h1>
            <p className="font-sans text-xs sm:text-sm text-muted-foreground mt-2">
              All photographs organized automatically by capture date.
            </p>
          </div>

          {/* Year Filter Controls */}
          {availableYears.length > 0 && (
            <YearSelector
              years={availableYears}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              totalMemories={totalMemories}
            />
          )}
        </div>

        {/* Timeline Content */}
        {loading ? (
          <SkeletonGallery />
        ) : years.length > 0 ? (
          <div className="space-y-16">
            {years.map((yearSummary) => (
              <div key={yearSummary.year} className="space-y-6">
                {/* Year Header Marker */}
                <div className="flex items-baseline justify-between border-b border-border pb-2">
                  <div className="flex items-baseline space-x-3">
                    <h2 className="font-display text-3xl sm:text-4xl font-medium text-amber-accent">
                      {yearSummary.year}
                    </h2>
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      {yearSummary.total_memories} {yearSummary.total_memories === 1 ? 'memory' : 'memories'}
                    </span>
                  </div>
                </div>

                {/* Months Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {yearSummary.months.map((month) => (
                    <MonthVaultCard
                      key={`${month.year}_${month.month}`}
                      month={month}
                      onOpenShare={handleOpenShare}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your archive is a blank canvas"
            description="Upload your first photographs to begin. We will immediately extract capture timestamps and construct your personal month-by-month vaults."
            actionText="Add your first memories"
            onAction={() => setIsUploadOpen(true)}
          />
        )}
      </div>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareDialog.isOpen}
        year={shareDialog.year}
        month={shareDialog.month}
        initialToken={shareDialog.token}
        onClose={() => setShareDialog((prev) => ({ ...prev, isOpen: false }))}
        onTokenChanged={() => loadMemories(selectedYear)}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => loadMemories(selectedYear)}
      />
    </AppShell>
  );
}
