import { type AiUsageLog } from '../../../../shared/models/entities/ai-usage-log.model';

export interface GetAiUsageLogsResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: AiUsageLog[];
}
