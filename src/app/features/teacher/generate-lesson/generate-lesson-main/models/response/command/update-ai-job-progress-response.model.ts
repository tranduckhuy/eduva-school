import { JobStatus } from '../../../../../../../shared/models/enum/job-status.enum';

export interface UpdateAiJobProgressResponse {
  jobId: string;
  status: JobStatus;
  wordCount: number;
  contentBlobName: string;
  previewContent: string;
  audioCost: number;
  videoCost: number;
  productBlobNameUrl: string;
  failureReason: string;
  lastModifiedAt: string;
}
