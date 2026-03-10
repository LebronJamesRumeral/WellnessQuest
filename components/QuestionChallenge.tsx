'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Challenge, ChallengeQuestion } from '@/lib/types';
import { X, Trophy, Clock, CheckCircle2, XCircle, Brain, Zap } from 'lucide-react';

interface QuestionChallengeProps {
  challenge: Challenge;
  onComplete: (correctAnswers: number, totalQuestions: number) => void;
  onCancel: () => void;
}

export default function QuestionChallenge({ challenge, onComplete, onCancel }: QuestionChallengeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  const questions = challenge.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (showExplanation ? 1 : 0)) / questions.length) * 100;

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newAnsweredQuestions = [...answeredQuestions, isCorrect];
    setAnsweredQuestions(newAnsweredQuestions);

    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Challenge complete
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      onComplete(correctAnswers, questions.length);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-accent/10 text-accent border-accent/30';
      case 'medium':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'hard':
        return 'bg-muted/50 text-muted-foreground border-muted/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={onCancel} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8 card-elevated glow-primary">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">{challenge.name}</CardTitle>
              </div>
              <CardDescription>{challenge.description}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="hover:bg-destructive/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-primary font-bold">
                {correctAnswers} / {answeredQuestions.length} Correct
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Question Tracker */}
          <div className="flex gap-2 flex-wrap mt-4">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx < currentQuestionIndex
                    ? answeredQuestions[idx]
                      ? 'bg-accent/20 border-2 border-accent text-accent'
                      : 'bg-muted/50 border-2 border-muted text-muted-foreground'
                    : idx === currentQuestionIndex
                    ? 'bg-primary/20 border-2 border-primary text-primary'
                    : 'bg-muted border-2 border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={`${getDifficultyColor(currentQuestion.difficulty)} border`}>
                {currentQuestion.difficulty.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{Math.floor((Date.now() - startTime) / 1000)}s</span>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-card border-2 border-primary/50">
              <h3 className="text-xl font-bold text-foreground leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentQuestion.correctAnswer;
                const showResult = showExplanation;

                let buttonClass = 'p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ';
                if (!showResult) {
                  buttonClass += isSelected
                    ? 'bg-primary/20 border-primary text-primary font-bold'
                    : 'bg-card border-muted hover:border-primary/50 hover:bg-primary/5';
                } else {
                  if (isCorrect) {
                    buttonClass += 'bg-accent/20 border-accent text-accent font-bold';
                  } else if (isSelected && !isCorrect) {
                    buttonClass += 'bg-muted/50 border-muted text-muted-foreground font-bold';
                  } else {
                    buttonClass += 'bg-card border-muted opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    disabled={showExplanation}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center font-bold">
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-base">{option}</span>
                      </div>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="w-6 h-6 text-accent-foreground" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && currentQuestion.explanation && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'bg-accent/10 border-accent/30'
                    : 'bg-muted/50 border-muted/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {selectedAnswer === currentQuestion.correctAnswer ? (
                      <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">
                      {selectedAnswer === currentQuestion.correctAnswer
                        ? '✨ Correct!'
                        : '💡 Learn More'}
                    </h4>
                    <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!showExplanation ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="flex-1 bg-primary hover:bg-primary/90 font-bold"
                size="lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="flex-1 bg-secondary hover:bg-secondary/90 font-bold"
                size="lg"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <Zap className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Complete Challenge
                    <Trophy className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Score Preview */}
          {showExplanation && currentQuestionIndex === questions.length - 1 && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                  <div className="text-2xl font-black text-primary">
                    {correctAnswers} / {questions.length}
                  </div>
                </div>
                <Trophy className="w-12 h-12 text-accent" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
