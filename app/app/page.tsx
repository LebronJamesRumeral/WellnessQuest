'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/context';
import MainDashboard from '@/components/MainDashboard';
import AppShellSkeleton from '@/components/AppShellSkeleton';
import Assessment from '@/components/Assessment';
import AssessmentResults from '@/components/AssessmentResults';
import { assessmentQuestions } from '@/lib/gameData';
import { AssessmentAnswer } from '@/lib/types';

function AppContent() {
  const router = useRouter();
  const [showAssessmentResults, setShowAssessmentResults] = useState(false);
  const { isLoggedIn, isAuthLoading, character, completeAssessment } = useGame();

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isAuthLoading, isLoggedIn, router]);

  if (isAuthLoading) {
    return <AppShellSkeleton />;
  }

  if (!isLoggedIn) {
    return <AppShellSkeleton />;
  }

  if (!character) {
    return <AppShellSkeleton />;
  }

  if (!character.assessmentResult) {
    return (
      <Assessment
        questions={assessmentQuestions}
        onComplete={async (answers: AssessmentAnswer[]) => {
          await completeAssessment(answers);
          setShowAssessmentResults(true);
        }}
      />
    );
  }

  if (showAssessmentResults && character.assessmentResult) {
    return (
      <AssessmentResults
        result={character.assessmentResult}
        onContinue={() => setShowAssessmentResults(false)}
      />
    );
  }

  return <MainDashboard />;
}

export default function AppPage() {
  return <AppContent />;
}