import { ContentType } from '../../../enum/lesson-material.enum';

interface LessonActivity {
  period: string;
  uploadedCount: number;
  aiGeneratedCount: number;
  totalCount: number;
}

interface LessonStatusStats {
  period: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface ContentTypeStats {
  pdf: number;
  doc: number;
  video: number;
  audio: number;
  total: number;
}

interface ReviewLesson {
  id: string;
  name: string;
  ownerName: string;
  contentType: ContentType;
}

interface TopTeachers {
  id: string;
  name: string;
  lessonCount: number;
  classesCount: number;
}

export interface DashboardSchoolAdminResponse {
  systemOverview: {
    totalUsers: number;
    contentModerators: number;
    teachers: number;
    students: number;
    classes: number;
    totalLessons: number;
    uploadedLessons: number;
    aiGeneratedLessons: number;
    usedStorage: number;
    currentSubscription: {
      name: string;
      price: number;
      maxStorage: number;
      billingCycle: string;
      startDate: string;
      endDate: string;
    };
  };
  lessonActivity: LessonActivity[];
  reviewLessons: ReviewLesson[];
  contentTypeStats: ContentTypeStats[];
  lessonStatusStats: LessonStatusStats[];
  topTeachers: TopTeachers[];
}
