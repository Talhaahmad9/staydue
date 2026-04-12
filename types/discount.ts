export interface DiscountCode {
  id: string;
  code: string;
  description: string;
  discountValue: number;
  applicablePlans: ("monthly" | "semester")[];
  isActive: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PlanType = "monthly" | "semester";
