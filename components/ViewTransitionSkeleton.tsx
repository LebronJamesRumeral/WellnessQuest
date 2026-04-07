'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Activity, BarChart3, Trophy, Scroll, Map } from 'lucide-react';

export type ViewTransitionViewType = 'activities' | 'achievements' | 'quests' | 'stats';

interface ViewTransitionSkeletonProps {
  view: ViewTransitionViewType;
}

function SectionHeaderSkeleton({ title }: { title: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full bg-primary/10" />
        <Skeleton className="h-8 w-48 bg-primary/10" />
      </div>
      <Skeleton className="h-4 w-80 max-w-full bg-muted" />
      <div className="flex flex-wrap gap-2 pt-1">
        <Skeleton className="h-8 w-24 rounded-full bg-muted/80" />
        <Skeleton className="h-8 w-28 rounded-full bg-muted/80" />
        <Skeleton className="h-8 w-20 rounded-full bg-muted/80" />
      </div>
      <p className="sr-only">{title}</p>
    </div>
  );
}

function ActivityLogSkeleton() {
  return (
    <div className="space-y-4">
      <SectionHeaderSkeleton title="Quest Log loading" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/60 bg-card/80 p-4 md:p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-11 w-11 rounded-xl bg-primary/10" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40 bg-primary/10" />
                  <Skeleton className="h-3 w-28 bg-muted" />
                </div>
              </div>
              <Skeleton className="h-8 w-10 rounded-md bg-secondary/15" />
            </div>
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-5/6 bg-muted" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <Skeleton className="h-16 rounded-lg bg-muted/80" />
              <Skeleton className="h-16 rounded-lg bg-muted/80" />
              <Skeleton className="h-16 rounded-lg bg-muted/80" />
              <Skeleton className="h-16 rounded-lg bg-muted/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BattleRecordsSkeleton() {
  return (
    <div className="space-y-8">
      <SectionHeaderSkeleton title="Battle Records loading" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm space-y-3">
            <Skeleton className="h-12 w-12 rounded-xl bg-primary/10" />
            <Skeleton className="h-6 w-16 bg-primary/10" />
            <Skeleton className="h-3 w-20 bg-muted" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full bg-secondary/15" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40 bg-primary/10" />
                <Skeleton className="h-3 w-24 bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Skeleton className="h-20 rounded-lg bg-muted/80" />
              <Skeleton className="h-20 rounded-lg bg-muted/80" />
              <Skeleton className="h-20 rounded-lg bg-muted/80" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-7 w-52 bg-primary/10" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <Skeleton className="h-10 w-10 rounded-full bg-secondary/15" />
                <div className="space-y-2 min-w-0 flex-1">
                  <Skeleton className="h-4 w-44 bg-primary/10" />
                  <Skeleton className="h-3 w-64 max-w-full bg-muted" />
                </div>
              </div>
              <Skeleton className="h-8 w-16 rounded-md bg-muted/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendsSkeleton() {
  return (
    <div className="space-y-6">
      <SectionHeaderSkeleton title="Hall of Legends loading" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/60 bg-card/80 p-4 md:p-5 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-14 w-14 rounded-xl bg-primary/10" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-36 bg-primary/10" />
                <Skeleton className="h-3 w-24 bg-muted" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-16 rounded-full bg-muted/80" />
                  <Skeleton className="h-6 w-20 rounded-full bg-muted/80" />
                </div>
              </div>
            </div>
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-5/6 bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestBoardSkeleton() {
  return (
    <div className="space-y-6">
      <SectionHeaderSkeleton title="Quest Board loading" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-20 rounded-full bg-muted/80" />
        <Skeleton className="h-9 w-24 rounded-full bg-muted/80" />
        <Skeleton className="h-9 w-24 rounded-full bg-muted/80" />
        <Skeleton className="h-9 w-20 rounded-full bg-muted/80" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton className="h-10 w-10 rounded-xl bg-primary/10" />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-5 w-44 bg-primary/10" />
                  <Skeleton className="h-3 w-60 max-w-full bg-muted" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full bg-secondary/15" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-28 rounded-full bg-muted/80" />
              <Skeleton className="h-12 w-full rounded-lg bg-muted/80" />
              <Skeleton className="h-10 w-full rounded-lg bg-muted/80" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-16 rounded-lg bg-muted/80" />
              <Skeleton className="h-16 rounded-lg bg-muted/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ViewTransitionSkeleton({ view }: ViewTransitionSkeletonProps) {
  if (view === 'activities') {
    return <ActivityLogSkeleton />;
  }

  if (view === 'stats') {
    return <BattleRecordsSkeleton />;
  }

  if (view === 'achievements') {
    return <LegendsSkeleton />;
  }

  return <QuestBoardSkeleton />;
}
