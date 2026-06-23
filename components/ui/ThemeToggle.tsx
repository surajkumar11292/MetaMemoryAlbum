'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('meta_theme');
    if (saved === 'light') {
      setIsLight(true);
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      setIsLight(false);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('meta_theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('meta_theme', 'dark');
    }
  };

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-muted-foreground hover:text-foreground border border-border hover:border-amber-accent transition-colors duration-200"
      title={isLight ? 'Switch to Obsidian Dark' : 'Switch to Warm Paper Light'}
      aria-label="Toggle Theme"
    >
      {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
