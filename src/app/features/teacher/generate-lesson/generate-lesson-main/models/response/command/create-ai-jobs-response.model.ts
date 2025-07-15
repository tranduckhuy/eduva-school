import { JobStatus } from '../../../../../../../shared/models/enum/job-status.enum';

export interface CreateAiJobsResponse {
  jobId: string;
  status: JobStatus;
}
