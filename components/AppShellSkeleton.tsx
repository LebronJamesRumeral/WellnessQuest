'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Bell, Moon, User, Shield, Home, Activity, Trophy, Scroll, Backpack, ShoppingCart, BarChart3 } from 'lucide-react';
import BrandMark from '@/components/BrandMark';

function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-3 md:p-4 shadow-sm">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-12" />
    </div>
  );
}

function SkeletonSectionCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-border/60 bg-card/80 p-4 md:p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

function StaticHeader() {
  const navItems = [
    { label: 'Adventurer\'s Hall', icon: Home },
    { label: 'Quest Log', icon: Activity },
    { label: 'Battle Records', icon: BarChart3 },
    { label: 'Hall of Legends', icon: Trophy },
    { label: 'Quest Board', icon: Scroll },
  ];

  return (
    <>
      <div className="hidden md:block border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <BrandMark size="md" showLabel labelClassName="text-sm leading-tight" />
              <div className="leading-tight hidden">
                <div className="text-xs text-muted-foreground">Embark on Your Epic Wellness Adventure</div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2 rounded-full px-3 py-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-semibold text-foreground">
                0 Gold
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Moon className="h-4 w-4" />
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Bell className="h-4 w-4" />
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BrandMark size="sm" showLabel labelClassName="text-sm leading-none" />
            <div className="text-[10px] text-muted-foreground">Loading your realm</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 border border-primary/20 px-2 py-1 text-xs font-semibold text-foreground">
              0
            </div>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Bell className="h-4 w-4" />
            </div>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <StaticHeader />

      <main className="container mx-auto px-4 py-6 pb-20 max-w-7xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-9 w-56 bg-primary/10" />
            <Skeleton className="h-4 w-80 max-w-full bg-muted" />
          </div>
          <Skeleton className="h-10 w-28 rounded-lg bg-secondary/15" />
        </div>

        <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <div className="rounded-xl border border-border/60 bg-linear-to-br from-primary/10 to-secondary/10 p-3 md:p-4 shadow-sm space-y-3 col-span-2 sm:col-span-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-12">
          <div className="space-y-4 md:space-y-6 lg:col-span-8">
            <SkeletonSectionCard className="bg-linear-to-br from-primary/10 via-card to-secondary/10" />
            <SkeletonSectionCard className="bg-card/70" />
            <SkeletonSectionCard className="bg-card/70" />
          </div>

          <div className="space-y-4 md:space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4 md:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-secondary/15" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-40 bg-primary/10" />
                  <Skeleton className="h-3 w-24 bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg bg-muted/80" />
                <Skeleton className="h-12 w-full rounded-lg bg-muted/80" />
                <Skeleton className="h-12 w-full rounded-lg bg-muted/80" />
                <Skeleton className="h-12 w-full rounded-lg bg-muted/80" />
                <Skeleton className="h-12 w-full rounded-lg bg-muted/80" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
        <div className="grid grid-cols-5 gap-2 p-2 pb-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-2 rounded-xl px-1 py-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-2.5 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
