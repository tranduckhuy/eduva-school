import { JobStatus } from '../../../../../../../shared/models/enum/job-status.enum';

export interface UpdateAiJobProgressResponse {
  jobId: string;
  status: JobStatus;
  wordCount: number;
  actualDuration: number;
  previewContent: string;
  contentBlobName: string;
  videoOutputBlobName: string;
  audioOutputBlobName: string;
  audioCost: number;
  videoCost: number;
  failureReason: string;
  lastModifiedAt: string;
}
