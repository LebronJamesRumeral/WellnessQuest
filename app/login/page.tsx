'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/context';
import Login from '@/components/Login';
import AppShellSkeleton from '@/components/AppShellSkeleton';

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, isAuthLoading } = useGame();

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      router.replace('/app');
    }
  }, [isAuthLoading, isLoggedIn, router]);

  if (isAuthLoading) {
    return <AppShellSkeleton />;
  }

  if (isLoggedIn) {
    return <AppShellSkeleton />;
  }

  return <Login />;
}