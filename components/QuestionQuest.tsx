'use client';

import React, { useState } from 'react';
import { Quest, GameSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Heart, RotateCcw } from 'lucide-react';

interface QuestionQuestProps {
  quest: Quest;
  onComplete: (sessionData: GameSession) => void;
  onCancel: () => void;
}

export default function QuestionQuest({ quest, onComplete, onCancel }: QuestionQuestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(false);

  const questions = quest.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  if (questCompleted) {
    const percentage = (score / questions.length) * 100;
    const rank = percentage === 100 ? 'S' : percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : 'C';
    
    // Calculate rewards based on rank
    const baseRewards = quest.rewards;
    const rankMultipliers: Record<string, number> = {
      'S': 1.5,
      'A': 1.25,
      'B': 1.1,
      'C': 1.0,
    };
    const multiplier = rankMultipliers[rank] || 1.0;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Quest Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{score}/{questions.length}</div>
              <div className="text-lg font-semibold text-muted-foreground">Accuracy: {percentage.toFixed(0)}%</div>
            </div>

            {/* Rank */}
            <div className="bg-secondary/20 rounded-lg p-4 text-center">
              <div className="text-sm text-muted-foreground mb-2">Rank</div>
              <div className="text-5xl font-bold text-secondary mb-3">{rank}</div>
              <div className="text-xs text-muted-foreground">
                {rank === 'S' && 'Perfect! Outstanding performance!'}
                {rank === 'A' && 'Excellent! Great job!'}
                {rank === 'B' && 'Good! Well done!'}
                {rank === 'C' && 'Complete! Keep improving!'}
              </div>
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">XP</div>
                <div className="text-lg font-bold text-primary">
                  {Math.round(baseRewards.experience * multiplier)}
                </div>
              </div>
              <div className="bg-accent/10 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Gold</div>
                <div className="text-lg font-bold text-accent">
                  {Math.round(baseRewards.gold * multiplier)}
                </div>
              </div>
            </div>

            {/* Button */}
            <Button
              onClick={() => {
                const sessionData: GameSession = {
                  id: `session-${Date.now()}`,
                  questId: quest.id,
                  questType: quest.type,
                  completionTime: (currentQuestionIndex + 1) * 15,
                  score: Math.round(percentage),
                  rank,
                  isPerfect: percentage === 100,
                  isPersonalBest: false,
                  date: new Date(),
                  rewards: {
                    experience: Math.round(baseRewards.experience * multiplier),
                    gold: Math.round(baseRewards.gold * multiplier),
                  },
                };
                onComplete(sessionData);
              }}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              Claim Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowResult(true);
  };

  const handleNext = () => {
    const isCorrect = selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer;
    setScore(prev => prev + (isCorrect ? 1 : 0));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowResult(false);
    } else {
      setQuestCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowResult(false);
    }
  };

  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
  const isCorrect = selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-hidden">
      <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>{quest.title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>×</Button>
          </div>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-6">
          {/* Question */}
          <div className="space-y-4">
            <div className="text-lg font-semibold">{currentQuestion.question}</div>

            {/* Options */}
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !isAnswered && handleAnswer(index)}
                  disabled={isAnswered}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? isCorrect
                        ? 'border-green-500 bg-green-50/20'
                        : 'border-red-500 bg-red-50/20'
                      : 'border-border hover:border-primary/50'
                  } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? isCorrect
                          ? 'border-green-500 bg-green-500'
                          : 'border-red-500 bg-red-500'
                        : 'border-border'
                    }`}>
                      {selectedAnswers[currentQuestionIndex] === index && (
                        <div className="text-white text-xs">✓</div>
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                    {isAnswered && index === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Feedback */}
            {showResult && (
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50/30 border border-green-500' : 'bg-red-50/30 border border-red-500'}`}>
                <div className={`font-semibold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '✓ Correct!' : '✗ Not quite right.'}
                </div>
                {currentQuestion.explanation && (
                  <p className="text-sm text-foreground">{currentQuestion.explanation}</p>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </Button>

            {isAnswered && (
              <Button
                onClick={handleNext}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next →'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
