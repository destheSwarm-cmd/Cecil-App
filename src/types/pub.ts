export type ProductCategory =
  | 'Beers & Lagers'
  | 'Spirits'
  | 'Wines'
  | 'Ciders & Coolers'
  | 'Premium'
  | 'Non-Alcoholic';

export type Supplier = 'SAB' | 'Heineken' | 'Distell' | 'Other';

export type StockConfidence = 'exact' | 'estimated';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // In Rand, e.g. 26.50
  warehouse_stock: number; // Cases in back storage
  floor_stock: number; // Individual loose bottles/units in cold bar
  case_size_units: number; // Typically 12 or 24 bottles per case
  stock_confidence: StockConfidence;
  reorder_level: number; // Threshold in cases
  active: boolean;
  supplier: Supplier;
  updated_at?: string;
}

export interface Delivery {
  id: string;
  product_id: string;
  product_name?: string;
  cases: number;
  supplier: Supplier;
  created_at: string;
}

export interface Pick {
  id: string;
  product_id: string;
  product_name?: string;
  cases: number;
  units?: number;
  picked_by: 'Cecil' | 'Helper';
  auto: boolean; // True if auto-reconciled by nightly routine
  created_at: string;
}

export interface PaymentBreakdown {
  cash: number;
  card: number;
  eft: number;
}

export interface SaleLineItem {
  product_id?: string;
  name: string;
  units_sold: number;
  rand_amount: number;
}

export interface DailySale {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  total_rand: number;
  payment_breakdown: PaymentBreakdown;
  line_items: SaleLineItem[];
  source: 'pos_photo' | 'manual' | 'quick';
  image_url?: string;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  suggested_cases: number;
  ordered_cases: number;
  unit_price_estimate?: number;
  reason?: string;
}

export interface Order {
  id: string;
  supplier: Supplier;
  items: OrderItem[];
  total_estimate: number;
  status: 'draft' | 'sent';
  created_at: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface PubSettings {
  business_name: string;
  address: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  helper_pin: string;
  supplier_sab_phone: string;
  supplier_heineken_phone: string;
  notify_low_stock: boolean;
  notify_order_day: boolean;
  notify_shrinkage: boolean;
  weekly_email_report: boolean;
}

export interface Discrepancy {
  id: string;
  product_id: string;
  product_name: string;
  missing_units: number;
  expected_floor: number;
  actual_floor: number;
  last_picked_by: 'Cecil' | 'Helper';
  last_pick_time: string;
  severity: 'warning' | 'critical';
  resolved?: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'delivery' | 'pick' | 'sale' | 'product_update' | 'order';
  payload: any;
  timestamp: string;
}
