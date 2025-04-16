// File: src/app/(pages)/lectures/[lectureId]/layout.tsx
import React from 'react';
import { Metadata } from 'next';

// Define dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
    return {
        title: 'Lecture View | Learning Management System',
        description: 'View lecture content and materials',
    };
}

export default function LectureLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-secondary/10">
            {children}
        </div>
    );
}