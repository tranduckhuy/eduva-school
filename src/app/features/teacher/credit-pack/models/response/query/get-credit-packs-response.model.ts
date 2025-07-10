import { CreditPack } from '../../../../../../shared/models/entities/credit-pack.model';

export interface GetCreditPacksResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: CreditPack[];
}
