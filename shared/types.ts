/**
 * Shared types between client and server
 * These types match the database schema
 */

// ============================================
// USERS
// ============================================

export interface User {
  id: number;
  club_id?: number | null;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  stripe_customer_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_login_at?: string;
}

// ============================================
// CLUBS
// ============================================

export interface Club {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
  website?: string;
  image_url: string;
  gallery?: string[];
  amenities: string[];
  rating: number;
  review_count: number;
  price_per_hour: number;
  default_booking_duration?: number;
  currency?: string;
  is_active: boolean;
  featured: boolean;
  court_count?: number;
  has_subscriptions?: boolean;
  fee_structure?: "user_pays_fee" | "shared_fee" | "club_absorbs_fee";
  service_fee_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// BOOKINGS
// ============================================

export interface Booking {
  id: number;
  booking_number: string;
  user_id: number;
  club_id: number;
  club_name: string;
  court_id: number;
  court_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment_status: string;
  confirmed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBookingData {
  user_id: number;
  club_id: number;
  court_id: number;
  time_slot_id?: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  total_price: number;
}

// ============================================
// EVENTS
// ============================================

export interface EventCourtSchedule {
  id?: number;
  event_id?: number;
  court_id: number;
  start_time: string;
  end_time: string;
  notes?: string | null;
  created_at?: string;
}

export interface Event {
  id: number;
  club_id: number;
  club_name?: string;
  event_type: "tournament" | "league" | "clinic" | "social" | "championship";
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  max_participants: number | null;
  current_participants: number;
  registration_fee: number;
  prize_pool: number;
  skill_level: "all" | "beginner" | "intermediate" | "advanced" | "expert";
  status: "draft" | "open" | "full" | "in_progress" | "completed" | "cancelled";
  courts_used: number[] | null;
  court_schedules?: EventCourtSchedule[];
  image_url: string | null;
  rules: string | null;
  organizer_name: string | null;
  organizer_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  club_id: number;
  event_type: Event["event_type"];
  title: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  max_participants?: number;
  registration_fee?: number;
  prize_pool?: number;
  skill_level?: Event["skill_level"];
  status?: Event["status"];
  courts_used?: number[];
  court_schedules?: Omit<
    EventCourtSchedule,
    "id" | "event_id" | "created_at"
  >[];
  image_url?: string;
  rules?: string;
  organizer_name?: string;
  organizer_email?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: number;
}

// ============================================
// PRIVATE CLASSES
// ============================================

export interface PrivateClass {
  id: number;
  booking_number: string;
  user_id: number;
  instructor_id: number;
  instructor_name?: string;
  club_id: number;
  club_name?: string;
  court_id: number | null;
  court_name?: string;
  class_type: "individual" | "group" | "semi_private";
  class_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  number_of_students: number;
  total_price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  payment_status: "pending" | "paid" | "refunded" | "failed";
  focus_areas: string[] | null;
  student_level: "beginner" | "intermediate" | "advanced" | "expert" | null;
  notes: string | null;
  instructor_notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePrivateClassData {
  user_id: number;
  instructor_id: number;
  club_id: number;
  court_id?: number;
  class_type: PrivateClass["class_type"];
  class_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  number_of_students?: number;
  total_price: number;
  focus_areas?: string[];
  student_level?: PrivateClass["student_level"];
  notes?: string;
}

// ============================================
// SUBSCRIPTIONS
// ============================================

export interface SubscriptionExtra {
  id: string;
  description: string;
}

export interface ClubSubscription {
  id: number;
  club_id: number;
  club_name?: string;
  name: string;
  description?: string;
  price_monthly: number;
  currency: string;
  stripe_product_id?: string;
  stripe_price_id?: string;

  // Booking benefits
  booking_discount_percent?: number;
  booking_credits_monthly?: number;

  // Additional service discounts
  bar_discount_percent?: number;
  merch_discount_percent?: number;
  event_discount_percent?: number;
  class_discount_percent?: number;

  // Custom extras
  extras?: SubscriptionExtra[] | string[];

  // Status and metadata
  is_active: boolean;
  display_order: number;
  max_subscribers?: number;
  current_subscribers: number;

  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  subscription_id: number;
  stripe_subscription_id?: string;
  status: "active" | "past_due" | "cancelled" | "paused";

  bookings_used_this_month?: number;
  next_billing_date?: string;

  started_at: string;
  current_period_start?: string;
  current_period_end?: string;
  cancelled_at?: string;

  created_at: string;
  updated_at: string;

  // Joined data
  subscription?: ClubSubscription;
}

export interface CreateSubscriptionData {
  club_id: number;
  name: string;
  description?: string;
  price_monthly: number;
  currency?: string;

  booking_discount_percent?: number;
  booking_credits_monthly?: number;

  bar_discount_percent?: number;
  merch_discount_percent?: number;
  event_discount_percent?: number;
  class_discount_percent?: number;

  extras?: SubscriptionExtra[];

  is_active?: boolean;
  display_order?: number;
  max_subscribers?: number;
}

export interface UpdateSubscriptionData extends Partial<CreateSubscriptionData> {
  id: number;
}

export interface SubscribeData {
  user_id: number;
  subscription_id: number;
  payment_method_id: string;
}

export interface CancelSubscriptionData {
  user_subscription_id: number;
}

// ============================================
// PAYMENT METHODS
// ============================================

export interface PaymentMethod {
  id: string;
  user_id: number;
  stripe_payment_method_id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created_at: string;
}
