// src/services/lecture-service.ts
import apiClient from '@/lib/api-client';

// Define types for better type checking
export interface Lecture {
  _id: string;
  title: string;
  description: string;
  chapterId: string;
  order: number;
  estimatedDuration: number;
  content: {
    type: string;
    data: any;
  };
  resources: Array<{
    title: string;
    type: string;
    url: string;
    description?: string;
  }>;
  transcript: boolean;
  hasActivity: boolean;
  isPublished: boolean;
  completionCriteria: {
    watchTime: number;
    activityRequired: boolean;
  };
  previousLecture?: string;
  nextLecture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptItem {
  time: number;
  text: string;
}

export interface NavigationData {
  chapterTitle: string;
  lectures: Array<{
    _id: string;
    title: string;
    order: number;
    completionStatus: 'completed' | 'in_progress' | 'not_started';
  }>;
}

export interface ProgressData {
  progress: number;
  currentTime?: number;
  currentPage?: number;
  currentSlide?: number;
  [key: string]: any;
}

/**
 * Get lecture details by ID
 */
export const getLectureById = async (id: string): Promise<Lecture> => {
  try {
    const response = await apiClient.get(`/lectures/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lecture:', error);
    throw error;
  }
};

/**
 * Get detailed lecture information including resources
 */
export const getLectureDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`/lectures/${id}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lecture details:', error);
    throw error;
  }
};

/**
 * Get lecture transcript
 */
export const getLectureTranscript = async (id: string): Promise<{ transcript: TranscriptItem[] }> => {
  try {
    const response = await apiClient.get(`/lectures/${id}/transcript`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lecture transcript:', error);
    throw error;
  }
};

/**
 * Get lecture resources
 */
export const getLectureResources = async (id: string) => {
  try {
    const response = await apiClient.get(`/lectures/${id}/resources`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lecture resources:', error);
    throw error;
  }
};

/**
 * Get all lectures for a chapter
 */
export const getLecturesByChapter = async (chapterId: string): Promise<NavigationData> => {
  try {
    const response = await apiClient.get(`/lectures/byChapter/${chapterId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lectures by chapter:', error);
    throw error;
  }
};

/**
 * Mark lecture as completed
 */
export const markLectureAsCompleted = async (id: string) => {
  try {
    const response = await apiClient.post(`/lectures/${id}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error marking lecture as completed:', error);
    throw error;
  }
};

/**
 * Update lecture progress
 */
export const updateLectureProgress = async (id: string, progressData: ProgressData) => {
  try {
    const response = await apiClient.post(`/lectures/${id}/progress`, progressData);
    return response.data;
  } catch (error) {
    console.error('Error updating lecture progress:', error);
    // Don't throw this error, just log it - we don't want to interrupt the user experience
    // for progress tracking issues
    return null;
  }
};