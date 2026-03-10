'use client';

import { useState } from 'react';
import { AssessmentQuestion, AssessmentAnswer, WellnessProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardList, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Map,
  Swords
} from 'lucide-react';

interface AssessmentProps {
  questions: AssessmentQuestion[];
  onComplete: (answers: AssessmentAnswer[]) => void;
}

export default function Assessment({ questions, onComplete }: AssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleOptionSelect = (optionId: string) => {
    if (currentQuestion.type === 'multi-select') {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleNext = () => {
    if (selectedOptions.length === 0) return;

    const selectedOption = currentQuestion.options.find(
      opt => opt.id === selectedOptions[0]
    );

    const answer: AssessmentAnswer = {
      questionId: currentQuestion.id,
      selectedOptions,
      value: selectedOption?.value || 0,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setSelectedOptions([]);

    if (isLastQuestion) {
      onComplete(newAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setAnswers(prev => prev.slice(0, -1));
      setSelectedOptions([]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Map className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Adventure Initiation</CardTitle>
          </div>
          <CardDescription>
            Answer these questions to discover your perfect quests! Our guild master will craft a personalized adventure tailored to your hero's journey.
          </CardDescription>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Quest {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{currentQuestion.question}</h3>
                <p className="text-sm text-muted-foreground capitalize flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5" />
                  Category: {currentQuestion.category}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 mt-4">
              {currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'scale' ? (
                <RadioGroup
                  value={selectedOptions[0]}
                  onValueChange={(value) => handleOptionSelect(value)}
                >
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label 
                        htmlFor={option.id} 
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      <Checkbox
                        id={option.id}
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={() => handleOptionSelect(option.id)}
                      />
                      <Label 
                        htmlFor={option.id} 
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={selectedOptions.length === 0}
              className="gap-2"
            >
              {isLastQuestion ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Begin Adventure!
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
