import { type JobStatus } from '../enum/job-status.enum';

export interface AiJob {
  id: string;
  jobStatus: JobStatus;
  status: string;
  topic: string;
  type: string;
  sourceBlobNames: string[];
  contentBlobName: string;
  videoOutputBlobName: string;
  audioOutputBlobName: string;
  wordCount: number;
  failureReason: string;
  createdAt: string;
  lastModifiedAt: string;
}
