'use client';

import React from 'react';

interface YearSelectorProps {
  years: number[];
  selectedYear: number | 'all';
  onSelectYear: (year: number | 'all') => void;
  totalMemories: number;
}

export function YearSelector({
  years,
  selectedYear,
  onSelectYear,
  totalMemories,
}: YearSelectorProps) {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectYear('all')}
        className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-200 border whitespace-nowrap ${
          selectedYear === 'all'
            ? 'bg-amber-accent text-deep-charcoal border-amber-accent font-semibold'
            : 'bg-surface-raised border-border text-muted-foreground hover:text-foreground hover:border-amber-accent/50'
        }`}
      >
        All Years ({totalMemories})
      </button>

      {years.map((year) => {
        const isSelected = selectedYear === year;
        return (
          <button
            key={year}
            onClick={() => onSelectYear(year)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-200 border whitespace-nowrap ${
              isSelected
                ? 'bg-amber-accent text-deep-charcoal border-amber-accent font-semibold'
                : 'bg-surface-raised border-border text-muted-foreground hover:text-foreground hover:border-amber-accent/50'
            }`}
          >
            {year}
          </button>
        );
      })}
    </div>
  );
}
