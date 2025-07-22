import { AiJob } from '../../../../../shared/models/entities/ai-job.model';

export interface GetAiJobCompletedResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: AiJob[];
}
