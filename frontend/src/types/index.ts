export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'admin' | 'customer';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  subcategories?: Category[];
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  color: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  color_hex: string | null;
  sku_variant: string;
  stock: number;
  additional_price: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sku: string;
  original_price: number;
  sale_price: number | null;
  discount_percent: number;
  category_id: string | null;
  tags: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_new_arrival: boolean;
  total_stock: number;
  avg_rating: number;
  review_count: number;
  total_sold: number;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  original_price: number;
  sale_price: number | null;
  discount_percent: number;
  avg_rating: number;
  review_count: number;
  total_stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_new_arrival: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  product: ProductListItem | null;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product: ProductListItem;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  coupon_code: string | null;
  tracking_number: string | null;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  user_name: string | null;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  recent_orders: { order_number: string; total_amount: number; status: string; created_at: string }[];
  top_products: { name: string; total_sold: number }[];
  monthly_revenue: { month: string; revenue: number; orders: number }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
