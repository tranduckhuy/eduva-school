import {
  ContentType,
  LessonMaterialStatus,
} from '../../../enum/lesson-material.enum';
import { BillingCycle } from '../../request/command/create-plan-payment-link-request.model';

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
  pendingPercentage: number;
  approvedPercentage: number;
  rejectedPercentage: number;
}

interface ContentTypeStats {
  pdf: number;
  doc: number;
  video: number;
  audio: number;
  total: number;
  pdfPercentage: number;
  docPercentage: number;
  videoPercentage: number;
  audioPercentage: number;
}

interface ReviewLesson {
  id: string;
  title: string;
  lessonStatus: LessonMaterialStatus;
  ownerName: string;
  createdAt: string;
  contentType: ContentType;
}

interface TopTeachers {
  id: string;
  fullName: string;
  lessonCount: number;
  classesCount: number;
}

export interface DashboardSchoolAdminResponse {
  systemOverview: {
    totalUsers: number;
    schoolAdmin: number;
    contentModerators: number;
    teachers: number;
    students: number;
    classes: number;
    totalLessons: number;
    uploadedLessons: number;
    aiGeneratedLessons: number;
    usedStorageBytes: number;
    usedStorageGB: number;
    currentSubscription: {
      id: string;
      name: string;
      price: number;
      maxStorageBytes: number;
      maxStorageGB: number;
      billingCycle: BillingCycle;
      startDate: string;
      endDate: string;
      amountPaid: number;
    };
  };
  lessonActivity: LessonActivity[];
  reviewLessons: ReviewLesson[];
  contentTypeStats: ContentTypeStats[];
  lessonStatusStats: LessonStatusStats[];
  topTeachers: TopTeachers[];
}
