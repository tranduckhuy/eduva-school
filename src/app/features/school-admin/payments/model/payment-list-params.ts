import { EntityListParams } from '../../../../shared/models/api/request/query/entity-list-params';

type PaymentPurpose =
  | 0 //CreditPackage
  | 1; //SchoolSubscription

type PaymentMethod =
  | 0 //VNPAY
  | 1; //PayOS
type PaymentStatus =
  | 0 //Pending
  | 1; //Paid

export interface PaymentListParams extends EntityListParams {
  paymentPurpose?: PaymentPurpose;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
}
