import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FlashbackExplorer } from '@/components/flashback/FlashbackExplorer';

export default function FlashbackPage() {
  return (
    <AppShell>
      <FlashbackExplorer />
    </AppShell>
  );
}
