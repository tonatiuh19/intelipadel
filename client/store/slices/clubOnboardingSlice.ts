import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || "/api";

// Types for onboarding data
export interface CourtOnboarding {
  name: string;
  court_type: "indoor" | "outdoor" | "covered";
  surface_type: "glass" | "concrete" | "artificial_grass";
  has_lighting: boolean;
  display_order: number;
}

export interface PricingRuleOnboarding {
  rule_type: "time_of_day" | "day_of_week" | "duration_discount";
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  price_modifier_type: "fixed" | "percentage";
  price_modifier_value: number;
  is_active: boolean;
}

export interface OperatingHours {
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface ClubOnboardingData {
  // Step 1: Basic Info (mandatory)
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  website?: string;

  // Step 2: Courts (mandatory)
  courts: CourtOnboarding[];

  // Step 3: Pricing & Hours (mandatory)
  price_per_hour: number;
  default_booking_duration: 60 | 90 | 120;
  currency: string;
  operating_hours: OperatingHours[];
  pricing_rules?: PricingRuleOnboarding[];

  // Step 4: Optional Features
  enable_events: boolean;
  enable_classes: boolean;
  enable_subscriptions: boolean;
  terms_and_conditions?: string;
  privacy_policy?: string;
  cancellation_policy?: string;

  // First super admin of the club (mandatory)
  admin_name: string;
  admin_email: string;
  admin_phone: string;
}

interface ClubOnboardingState {
  data: Partial<ClubOnboardingData>;
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

const initialState: ClubOnboardingState = {
  data: {
    country: "México",
    currency: "MXN",
    default_booking_duration: 90,
    enable_events: false,
    enable_classes: false,
    enable_subscriptions: false,
    courts: [],
    operating_hours: [
      {
        day_of_week: "monday",
        open_time: "08:00",
        close_time: "22:00",
        is_closed: false,
      },
      {
        day_of_week: "tuesday",
        open_time: "08:00",
        close_time: "22:00",
        is_closed: false,
      },
      {
        day_of_week: "wednesday",
        open_time: "08:00",
        close_time: "22:00",
        is_closed: false,
      },
      {
        day_of_week: "thursday",
        open_time: "08:00",
        close_time: "22:00",
        is_closed: false,
      },
      {
        day_of_week: "friday",
        open_time: "08:00",
        close_time: "22:00",
        is_closed: false,
      },
      {
        day_of_week: "saturday",
        open_time: "08:00",
        close_time: "22:00",
        is_closed: false,
      },
      {
        day_of_week: "sunday",
        open_time: "08:00",
        close_time: "22:00",
        is_closed: false,
      },
    ],
  },
  currentStep: 1,
  totalSteps: 5,
  isSubmitting: false,
  isSuccess: false,
  error: null,
};

// Async thunk to submit onboarding data
export const submitClubOnboarding = createAsyncThunk(
  "clubOnboarding/submit",
  async (data: ClubOnboardingData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/clubs/onboard`, {
        ...data,
        is_active: false, // Club needs Intelipadel team review
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Error al registrar el club",
      );
    }
  },
);

// Generate slug from club name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

const clubOnboardingSlice = createSlice({
  name: "clubOnboarding",
  initialState,
  reducers: {
    updateBasicInfo: (
      state,
      action: PayloadAction<Partial<ClubOnboardingData>>,
    ) => {
      state.data = { ...state.data, ...action.payload };
      // Auto-generate slug if name changes
      if (action.payload.name) {
        state.data.slug = generateSlug(action.payload.name);
      }
    },
    updateCourts: (state, action: PayloadAction<CourtOnboarding[]>) => {
      state.data.courts = action.payload;
    },
    addCourt: (state, action: PayloadAction<CourtOnboarding>) => {
      if (!state.data.courts) {
        state.data.courts = [];
      }
      state.data.courts.push(action.payload);
    },
    removeCourt: (state, action: PayloadAction<number>) => {
      if (state.data.courts) {
        state.data.courts.splice(action.payload, 1);
        // Update display order
        state.data.courts.forEach((court, index) => {
          court.display_order = index + 1;
        });
      }
    },
    updatePricingAndHours: (
      state,
      action: PayloadAction<Partial<ClubOnboardingData>>,
    ) => {
      state.data = { ...state.data, ...action.payload };
    },
    updateOperatingHours: (state, action: PayloadAction<OperatingHours[]>) => {
      state.data.operating_hours = action.payload;
    },
    updateOptionalFeatures: (
      state,
      action: PayloadAction<Partial<ClubOnboardingData>>,
    ) => {
      state.data = { ...state.data, ...action.payload };
    },
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    goToStep: (state, action: PayloadAction<number>) => {
      if (action.payload >= 1 && action.payload <= state.totalSteps) {
        state.currentStep = action.payload;
      }
    },
    resetOnboarding: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitClubOnboarding.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitClubOnboarding.fulfilled, (state) => {
        state.isSubmitting = false;
        state.isSuccess = true;
      })
      .addCase(submitClubOnboarding.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateBasicInfo,
  updateCourts,
  addCourt,
  removeCourt,
  updatePricingAndHours,
  updateOperatingHours,
  updateOptionalFeatures,
  nextStep,
  previousStep,
  goToStep,
  resetOnboarding,
} = clubOnboardingSlice.actions;

export default clubOnboardingSlice.reducer;
