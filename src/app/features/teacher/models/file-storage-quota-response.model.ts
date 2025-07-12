export interface FileStorageQuotaResponse {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  usedGB: number;
  limitGB: number;
  remainingGB: number;
  usagePercentage: number;
}
