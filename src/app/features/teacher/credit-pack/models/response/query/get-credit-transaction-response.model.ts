import { PaymentStatus } from '../../../../../../shared/models/entities/payment.model';

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
}

interface AiCreditPack {
  id: string;
  name: string;
  price: number;
  credits: number;
  bonusCredits: number;
}

export interface CreditTransaction {
  id: string;
  totalCredits: number;
  createdAt: string;
  paymentStatus: PaymentStatus;
  user: User;
  aiCreditPack: AiCreditPack;
  transactionCode: string;
  amount: number;
  paymentTransactionId: string;
}

export interface GetCreditTransactionResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: CreditTransaction[];
}
