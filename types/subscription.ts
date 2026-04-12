export type SubscriptionStatus = "pending" | "active" | "expired" | "rejected";
export type PlanType = "monthly" | "semester";

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  startDate: Date | null;
  endDate: Date | null;
  transactionId: string;
  screenshotKey: string;
  paymentMethod: string;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
