import { type JobStatus } from '../../../../../../../shared/models/enum/job-status.enum';

export interface CreateAiJobResponse {
  jobId: string;
  status: JobStatus;
}
