import { Payment } from './payment.model';

type Status =
  | 0 // Active
  | 1 // Pending
  | 2 // Expired
  | 3; // Canceled

type BillingCycle =
  | 0 // Monthly
  | 1; // Yearly

interface School {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
}
interface Plan {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  storageLimitGB: number;
  price: number;
}

interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

export interface SchoolSubscriptionDetail {
  id: string;
  startDate: string;
  endDate: string;
  subscriptionStatus: Status;
  billingCycle: BillingCycle;
  createdAt: string;
  school: School;
  plan: Plan;
  paymentTransaction: Payment;
  user: User;
}
