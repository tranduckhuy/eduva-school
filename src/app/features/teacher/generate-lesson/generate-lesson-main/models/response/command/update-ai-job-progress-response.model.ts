import { type JobStatus } from '../../../../../../../shared/models/enum/job-status.enum';

export interface UpdateAiJobProgressResponse {
  jobId: string;
  status: JobStatus;
  title: string;
  language: string;
  estimatedDurationMinutes: number;
  actualDurationSeconds: number;
  previewContent: string;
  contentBlobName: string;
  videoOutputBlobNameUrl: string;
  audioOutputBlobNameUrl: string;
  audioCost: number;
  videoCost: number;
  failureReason: string;
  lastModifiedAt: string;
}
