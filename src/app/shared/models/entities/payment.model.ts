export enum PaymentPurpose {
  CreditPackage = 0,
  SchoolSubscription = 1,
}

export enum PaymentMethod {
  VNPAY = 0,
  PayOS = 1,
}

export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
}

interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
}

export interface Payment {
  id: string;
  transactionCode: string;
  amount: number;
  paymentItemId: number;
  paymentPurpose: PaymentPurpose;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  user: User;
}
