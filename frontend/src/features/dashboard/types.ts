export type StorePlan = "BASIC" | "PRO" | "ENTERPRISE";

export interface UserStore {
  id: string;
  name: string;
  slug: string;
  plan: StorePlan;
  allowsDelivery: boolean;
  allowsPickup: boolean;
  productsCount: number;
  status: "active" | "draft" | "maintenance";
  createdAt: string;
}

export type CreateStoreInput = {
  name: string;
  slug: string;
  plan: StorePlan;
  allowsDelivery: boolean;
  allowsPickup: boolean;
};

export type UpdateStoreInput = Partial<
  Omit<UserStore, "id" | "createdAt">
>;

