import { User } from './user.model';
import { JobStatus } from '../enum/job-status.enum';

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
  audioCost: number;
  videoCost: number;
  wordCount: number;
  failureReason: string;
  userId: string;
  user: User;
  createdAt: string;
  lastModifiedAt: string;
}
