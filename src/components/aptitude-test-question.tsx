// components/aptitude-test-question.tsx
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Question {
  _id: string;
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
    _id: string;
  }[];
  type: string;
}

interface AptitudeTestQuestionProps {
  question: Question;
  selectedAnswer: string;
  onSelectAnswer: (optionId: string) => void;
}

const AptitudeTestQuestion: React.FC<AptitudeTestQuestionProps> = ({
  question,
  selectedAnswer,
  onSelectAnswer
}) => {
  return (
    <div className="space-y-6">
      <div className="text-xl font-medium">{question.text}</div>

      <RadioGroup
        value={selectedAnswer}
        onValueChange={onSelectAnswer}
        className="space-y-3"
      >
        {question.options.map((option) => (
          <Card
            key={option._id}
            className={`border ${
              selectedAnswer === option._id ? "border-primary" : "border-border"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 py-1">
                <RadioGroupItem value={option._id} id={option._id} />
                <Label
                  htmlFor={option._id}
                  className="font-normal cursor-pointer flex-1"
                >
                  {option.text}
                </Label>
              </div>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
};

export default AptitudeTestQuestion;
