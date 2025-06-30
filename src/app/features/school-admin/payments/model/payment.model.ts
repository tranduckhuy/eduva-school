type PaymentPurpose =
  | 0 //CreditPackage
  | 1; //SchoolSubscription

type PaymentMethod =
  | 0 //VNPAY
  | 1; //PayOS
type PaymentStatus =
  | 0 //Pending
  | 1; //Paid

interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
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
