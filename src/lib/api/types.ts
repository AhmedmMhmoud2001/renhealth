/** Flexible types matching Laravel-style ecommerce API (Postman: ren-health). */

export type ApiEnvelope<T> = {
  data: T;
  message?: string;
  status?: boolean | number;
};

export type Paginated<T> = {
  data: T[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  links?: Record<string, string | null>;
};

export type User = {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  [key: string]: unknown;
};

export type AuthPayload = {
  token?: string;
  access_token?: string;
  user?: User;
  [key: string]: unknown;
};

export type StoreConfig = {
  name?: string;
  currency?: string;
  logo?: string;
  app_name?: string;
  logo_url?: string;
  [key: string]: unknown;
};

export type DeliveryZone = {
  id: number | string;
  name: string;
  is_active?: boolean | number;
  delivery_fees?: number | string;
  delivery_fee?: number | string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  center_lat?: string | number | null;
  center_lng?: string | number | null;
  polygon?: Array<
    | [number | string, number | string]
    | {
        lat?: number | string;
        lng?: number | string;
        latitude?: number | string;
        longitude?: number | string;
      }
  >;
  coordinates?: Array<[number | string, number | string]>;
  [key: string]: unknown;
};

export type Branch = {
  id: number | string;
  name: string;
  address?: string;
  latitude?: string | number;
  longitude?: string | number;
  phone?: string;
  is_active?: boolean;
  [key: string]: unknown;
};

export type Category = {
  id: number | string;
  name: string;
  slug?: string;
  image?: string | null;
  parent_id?: number | string | null;
  children?: Category[];
  [key: string]: unknown;
};

export type Brand = {
  id: number | string;
  name: string;
  slug?: string;
  image?: string | null;
  [key: string]: unknown;
};

export type Product = {
  id: number | string;
  name: string;
  slug?: string;
  description?: string | null;
  short_description?: string | null;
  price: number | string;
  final_price?: number | string | null;
  sale_price?: number | string | null;
  discount_price?: number | string | null;
  image?: string | null;
  thumbnail?: string | null;
  thumb_image?: string | null;
  images?: Array<string | { url?: string; path?: string }>;
  rating?: number | string;
  reviews_count?: number;
  rates_count?: number;
  stock?: number;
  quantity?: number;
  is_featured?: boolean | number;
  featured?: boolean | number;
  is_new?: boolean | number;
  is_wishlisted?: boolean;
  brand?: Brand | string | null;
  brand_id?: number | string;
  category?: Category | string | null;
  category_id?: number | string;
  goal_id?: number | string;
  wishlisted?: boolean;
  units?: Array<{
    id?: number | string;
    unit_id?: string | number;
    name?: string;
    is_default?: boolean;
    price?: number | string;
    final_price?: number | string;
    stock?: number;
  }>;
  [key: string]: unknown;
};

export type Goal = {
  id: number | string;
  name: string;
  title?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  products_count?: number;
  [key: string]: unknown;
};

export type Slider = {
  id: number | string;
  title?: string;
  subtitle?: string;
  description?: string | null;
  image?: string | null;
  link?: string | null;
  type?: string;
  [key: string]: unknown;
};

export type Offer = {
  id: number | string;
  name?: string;
  title?: string;
  description?: string | null;
  image?: string | null;
  price?: number | string;
  type?: string;
  total_price_before?: number | string;
  total_price_after?: number | string;
  is_wishlisted?: boolean;
  is_active?: boolean;
  is_valid?: boolean;
  start_date?: string;
  end_date?: string;
  show_countdown?: boolean;
  countdown_ends_at?: string | null;
  offerable?: {
    kind?: string;
    id?: number | string;
    name?: string;
    slug?: string;
    thumbnail?: string | null;
    price?: number | string;
  } | null;
  product_units?: Array<Record<string, unknown>>;
  package_items?: Array<Record<string, unknown>>;
  quantity_tiers?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type CartItem = {
  id: number | string;
  product_id?: number | string;
  quantity: number;
  price?: number | string;
  product?: Product;
  [key: string]: unknown;
};

export type Cart = {
  items?: CartItem[];
  products?: CartItem[];
  data?: CartItem[];
  subtotal?: number | string;
  total?: number | string;
  discount?: number | string;
  shipping?: number | string;
  coupon?: string | null;
  items_count?: number;
  [key: string]: unknown;
};

export type Address = {
  id: number | string;
  name: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  latitude?: string | number;
  longitude?: string | number;
  is_default?: boolean | number;
  [key: string]: unknown;
};

export type Order = {
  id: number | string;
  number?: string;
  status?: string;
  total?: number | string;
  payment_method?: string;
  payment_status?: string;
  created_at?: string;
  items?: CartItem[];
  [key: string]: unknown;
};

export type ProductsQuery = {
  search?: string;
  status?: string;
  sort?: string;
  per_page?: number | string;
  page?: number | string;
  category_id?: number | string;
  brand_id?: number | string;
  goal_id?: number | string;
  min_price?: number | string;
  max_price?: number | string;
  is_new?: number | string;
  featured?: number | string;
  wishlisted?: boolean | string;
};

export type CheckoutPayload = {
  address_id: number | string;
  shipping_day: string;
  is_fast_shipping?: boolean | string | number;
  payment_method: string;
  coupon_code?: string | null;
  offer_code?: string | null;
  use_wallet?: boolean | string | number;
  notes?: string;
  gift_offer_id?: string | null;
  gift_product_id?: string | null;
  item_notes?: Array<{
    product_id: number | string;
    variant_id?: number | string | null;
    note?: string;
  }>;
};

export type Coupon = {
  id: number | string;
  code?: string;
  discount?: number | string;
  discount_type?: string;
  min_order_total?: number | string;
  max_uses?: number;
  expires_at?: string;
  is_active?: boolean | number;
  [key: string]: unknown;
};

export type Notification = {
  id: number | string;
  title?: string;
  body?: string;
  message?: string;
  type?: string;
  read_at?: string | null;
  is_read?: boolean | number;
  created_at?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

export type TicketMessage = {
  id: number | string;
  message: string;
  sender?: string;
  sender_type?: string;
  attachment?: string | null;
  created_at?: string;
  [key: string]: unknown;
};

export type RefundRequest = {
  id: number | string;
  order_id?: number | string;
  reason?: string;
  details?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type SupportChatMessage = {
  id: number | string;
  message: string;
  sender?: string;
  sender_type?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type SupportChat = {
  id: number | string;
  subject?: string;
  status?: string;
  messages?: SupportChatMessage[];
  created_at?: string;
  [key: string]: unknown;
};

export type WalletTransaction = {
  id: number | string;
  amount?: number | string;
  type?: string;
  description?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type CmsSection = {
  title: string;
  body: string;
  icon?: string | null;
  image?: string | null;
  [key: string]: unknown;
};

export type CmsPage = {
  id: number | string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  sections?: CmsSection[];
  [key: string]: unknown;
};

export type JournalArticle = {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  category?: string | null;
  image?: string | null;
  read_time?: string | null;
  readTime?: string | null;
  created_at?: string;
  [key: string]: unknown;
};
