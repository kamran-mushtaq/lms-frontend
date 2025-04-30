// app/(pages)/manage/study-plans/api/study-plans-api.ts
import apiClient from "@/lib/api-client";
import {
  StudyPlanSchedule,
  StudySession,
  StudyProgress,
  StudyAnalytics,
  Student,
  Subject
} from "../types";

const API_BASE = "/study-plans";

// Study Schedules API
export const getStudyPlans = async () => {
  return apiClient.get<StudyPlanSchedule[]>(`${API_BASE}/schedules`);
};

export const getStudyPlanById = async (id: string) => {
  return apiClient.get<StudyPlanSchedule>(`${API_BASE}/schedules/${id}`);
};

export const getStudentPlans = async (studentId: string) => {
  return apiClient.get<StudyPlanSchedule[]>(`${API_BASE}/schedules/${studentId}`);
};

export const getActiveStudyPlan = async (studentId: string) => {
  return apiClient.get<StudyPlanSchedule>(`${API_BASE}/schedules/${studentId}/active`);
};

export const createStudyPlan = async (data: Omit<StudyPlanSchedule, 'id'>) => {
  return apiClient.post<StudyPlanSchedule>(`${API_BASE}/schedules/${data.studentId}`, data);
};

export const updateStudyPlan = async (id: string, studentId: string, data: Partial<StudyPlanSchedule>) => {
  return apiClient.put<StudyPlanSchedule>(`${API_BASE}/schedules/${studentId}/${id}`, data);
};

export const deleteStudyPlan = async (id: string, studentId: string) => {
  return apiClient.delete(`${API_BASE}/schedules/${studentId}/${id}`);
};

// Study Sessions API
export const startStudySession = async (data: Pick<StudySession, 'studentId' | 'subjectId' | 'scheduleId'>) => {
  return apiClient.post<StudySession>(`/study-sessions/${data.studentId}/start`, data);
};

export const endStudySession = async (studentId: string, sessionId: string, data: Partial<StudySession>) => {
  return apiClient.put<StudySession>(`/study-sessions/${studentId}/end/${sessionId}`, data);
};

export const getActiveSession = async (studentId: string) => {
  return apiClient.get<StudySession | null>(`/study-sessions/${studentId}/active`);
};

export const getStudySessions = async (studentId: string, params?: { startDate?: string; endDate?: string }) => {
  return apiClient.get<StudySession[]>(`/study-sessions/${studentId}/list`, { params });
};

export const getStudySessionById = async (studentId: string, sessionId: string) => {
  return apiClient.get<StudySession>(`/study-sessions/${studentId}/session/${sessionId}`);
};

export const deleteStudySession = async (studentId: string, sessionId: string) => {
  return apiClient.delete(`/study-sessions/${studentId}/session/${sessionId}`);
};

// Study Analytics API
export const getStudyAnalytics = async (studentId: string, params?: { period?: 'day' | 'week' | 'month' | 'year' }) => {
  return apiClient.get<StudyAnalytics>(`/study-sessions/${studentId}/analytics`, { params });
};

export const getWeeklyProgress = async (studentId: string, year: number, week: number) => {
  return apiClient.get<StudyProgress>(`/study-progress/${studentId}/weekly/${year}/${week}`);
};

export const getProgressSummary = async (studentId: string) => {
  return apiClient.get<StudyProgress>(`/study-progress/${studentId}/summary`);
};

// Student API for dropdown selections
export const getStudents = async () => {
  return apiClient.get<Student[]>('/users/type/student');
};

// Subject API for dropdown selections
export const getStudentSubjects = async (studentId: string) => {
  return apiClient.get<Subject[]>(`/enrollment/student/${studentId}/subjects`);
};