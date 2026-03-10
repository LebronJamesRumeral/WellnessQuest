'use client';

import { useState } from 'react';
import { GameProvider, useGame } from '@/lib/context';
import Login from '@/components/Login';
import MainDashboard from '@/components/MainDashboard';
import Assessment from '@/components/Assessment';
import AssessmentResults from '@/components/AssessmentResults';
import { assessmentQuestions } from '@/lib/gameData';
import { AssessmentAnswer } from '@/lib/types';

function GameContent() {
  const [showAssessmentResults, setShowAssessmentResults] = useState(false);
  const { isLoggedIn, character, completeAssessment } = useGame();

  // Step 1: Show login if not authenticated
  if (!isLoggedIn) {
    return <Login />;
  }

  // Step 2: Character is auto-created after login; keep a minimal loading state
  if (!character) {
    return null;
  }

  // Step 3: Show assessment for new users
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

  // Step 4: Show assessment results
  if (showAssessmentResults && character.assessmentResult) {
    return (
      <AssessmentResults
        result={character.assessmentResult}
        onContinue={() => setShowAssessmentResults(false)}
      />
    );
  }

  // Step 5: Show main dashboard
  return <MainDashboard />;
}

export default function Home() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
