export class CreateSubscriptionDto {
  name: string;
  plan?: string;
  price: number;
  currency: string = 'USD';
  billing_cycle: string;
  start_date: string;
  renewal_date: string;
  payment_method?: string;
  account?: string;
  category?: string;
  status: string = 'active';
  cancellation_info?: string;
  notes?: string;
}

export class UpdateSubscriptionDto {
  name?: string;
  plan?: string;
  price?: number;
  currency?: string;
  billing_cycle?: string;
  start_date?: string;
  renewal_date?: string;
  payment_method?: string;
  account?: string;
  category?: string;
  status?: string;
  cancellation_info?: string;
  notes?: string;
}

export interface Subscription {
  id: string;
  name: string;
  plan?: string;
  price: number;
  currency: string;
  billing_cycle: string;
  start_date: string;
  renewal_date: string;
  payment_method?: string;
  account?: string;
  category?: string;
  status: string;
  cancellation_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  synced_at: string;
}

export class SubscriptionResponseDto implements Subscription {
  id: string;
  name: string;
  plan?: string;
  price: number;
  currency: string;
  billing_cycle: string;
  start_date: string;
  renewal_date: string;
  payment_method?: string;
  account?: string;
  category?: string;
  status: string;
  cancellation_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  synced_at: string;
}

export class SubscriptionFilterDto {
  status?: string;
  category?: string;
  search?: string;
}
