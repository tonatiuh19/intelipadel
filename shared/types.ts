/**
 * Shared types between client and server
 * These types match the database schema
 */

// ============================================
// USERS
// ============================================

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  date_of_birth?: string;
  created_at: string;
  last_login?: string;
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
  currency?: string;
  is_active: boolean;
  featured: boolean;
  court_count?: number;
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
