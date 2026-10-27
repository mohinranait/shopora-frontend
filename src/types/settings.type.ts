export interface IWebsiteSettings {
  // General & Store Identity
  site_name: string;
  site_tagline: string;
  site_logo: string;
  site_favicon: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  is_maintenance_mode: boolean;
  maintenance_message: string;

  // Shipping & Logistics
  shipping_fee_standard: number;
  shipping_fee_express: number;
  free_shipping_threshold: number;
  estimated_delivery_metro: string;
  estimated_delivery_national: string;
  enable_free_shipping_promo: boolean;

  // Commission & Vendors
  default_commission_rate: number;
  min_payout_threshold: number;
  auto_approve_sellers: boolean;
  auto_approve_products: boolean;

  // Payment & Checkout
  currency: string;
  currency_symbol: string;
  enable_cod: boolean;
  enable_bkash: boolean;
  bkash_merchant_number: string;
  enable_nagad: boolean;
  nagad_merchant_number: string;
  vat_percentage: number;
  allow_guest_checkout: boolean;

  // SEO & Social
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  google_analytics_id: string;
  facebook_pixel_id: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  social_twitter: string;

  // Inventory & Notifications
  low_stock_threshold: number;
  notify_admin_on_order: boolean;
  notify_admin_on_seller_signup: boolean;

  [key: string]: string | number | boolean | null | undefined;
}
