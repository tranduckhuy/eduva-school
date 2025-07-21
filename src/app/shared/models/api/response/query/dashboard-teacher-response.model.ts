import { ContentType } from '../../../enum/lesson-material.enum';

interface LessonActivity {
  period: string;
  uploadedCount: number;
  aiGeneratedCount: number;
  totalCount: number;
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

interface RecentLessons {
  id: string;
  name: string;
  ownerName: string;
  contentType: ContentType;
}

interface QuestionVolumeTrend {
  period: string;
  total: number;
}

interface UnAnswerQuestion {
  id: string;
  title: string;
  ownerName: string;
  lessonName: string;
}

export interface DashboardTeacherResponse {
  systemOverview: {
    totalStudents: number;
    totalClasses: number;
    totalLessons: number;
    uploadedLessons: number;
    aiGeneratedLessons: number;
    //For teachers, these are lessons pending approval; for reviewers, these are lessons not yet reviewed.
    totalPendingLessons: number;
    remainCreditPoints: number;
    unansweredQuestions: number;
    usedStorage: number;
  };
  lessonActivity: LessonActivity[];
  questionVolumeTrend: QuestionVolumeTrend[];
  contentTypeStats: ContentTypeStats[];
  // For Content Moderator
  reviewLessons: ReviewLesson[];
  // For Teacher and Content Moderators
  recentLessons: RecentLessons[];
  unAnswerQuestions: UnAnswerQuestion[];
}
