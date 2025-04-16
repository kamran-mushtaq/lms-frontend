import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; // Assuming you have a Progress component
import Image from 'next/image';

interface SubjectCardProps {
  subjectId: string;
  title: string;
  imageUrl: string;
  progress: number; // Progress percentage (0-100)
  // Add other relevant props like description, last accessed, etc.
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  subjectId,
  title,
  imageUrl,
  progress,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out">
      <CardHeader className="p-0 relative h-32">
        {/* Using placeholder for now, replace with actual image */}
        <Image
          src={imageUrl || '/placeholder.png'} // Use placeholder if no image URL
          alt={`${title} cover image`}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </CardHeader>
      <CardContent className="pt-4">
        <CardTitle className="text-lg font-semibold mb-2">{title}</CardTitle>
        {/* Optional: Add description or other details here */}
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <span className="text-sm text-muted-foreground mb-1">Progress</span>
        <Progress value={progress} className="w-full" />
        <span className="text-xs text-muted-foreground mt-1 self-end">{progress}%</span>
      </CardFooter>
    </Card>
  );
};

export default SubjectCard;