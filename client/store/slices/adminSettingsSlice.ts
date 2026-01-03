import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface PriceRule {
  id: number;
  club_id: number;
  court_id: number | null;
  rule_name: string;
  rule_type: "time_of_day" | "day_of_week" | "seasonal" | "special_date";
  start_time: string | null;
  end_time: string | null;
  days_of_week: number[] | null;
  start_date: string | null;
  end_date: string | null;
  price_per_hour: number;
  priority: number;
  is_active: boolean;
}

interface ClubSchedule {
  id: number;
  club_id: number;
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
}

interface Court {
  id: number;
  name: string;
  club_id: number;
}

interface FeeStructure {
  fee_structure: "user_pays_fee" | "shared_fee" | "club_absorbs_fee";
  service_fee_percentage: number;
  fee_terms_accepted_at: string | null;
}

interface AdminSettingsState {
  priceRules: PriceRule[];
  schedules: ClubSchedule[];
  courts: Court[];
  basePrice: number;
  defaultDuration: number;
  feeStructure: FeeStructure | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: AdminSettingsState = {
  priceRules: [],
  schedules: [],
  courts: [],
  basePrice: 45,
  defaultDuration: 60,
  feeStructure: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Async thunks
export const getPriceRules = createAsyncThunk(
  "adminSettings/getPriceRules",
  async (clubId: number, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.get(
        `/api/admin/price-rules?club_id=${clubId}`,
        {
          headers: { Authorization: `Bearer ${sessionToken}` },
        },
      );
      // Parse and ensure proper data types
      const rules = response.data.priceRules.map((rule: any) => ({
        ...rule,
        price_per_hour: parseFloat(rule.price_per_hour),
        priority: parseInt(rule.priority),
        days_of_week: rule.days_of_week
          ? typeof rule.days_of_week === "string"
            ? JSON.parse(rule.days_of_week)
            : rule.days_of_week
          : null,
        is_active: Boolean(rule.is_active),
      }));
      return rules;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch price rules",
      );
    }
  },
);

export const createPriceRule = createAsyncThunk(
  "adminSettings/createPriceRule",
  async (data: Omit<PriceRule, "id">, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.post("/api/admin/price-rules", data, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create price rule",
      );
    }
  },
);

export const updatePriceRule = createAsyncThunk(
  "adminSettings/updatePriceRule",
  async (data: PriceRule, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const { id, ...ruleData } = data;
      const response = await axios.put(
        `/api/admin/price-rules/${id}`,
        ruleData,
        {
          headers: { Authorization: `Bearer ${sessionToken}` },
        },
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update price rule",
      );
    }
  },
);

export const deletePriceRule = createAsyncThunk(
  "adminSettings/deletePriceRule",
  async (id: number, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      await axios.delete(`/api/admin/price-rules/${id}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete price rule",
      );
    }
  },
);

export const getSchedules = createAsyncThunk(
  "adminSettings/getSchedules",
  async (clubId: number, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.get(
        `/api/admin/schedules?club_id=${clubId}`,
        {
          headers: { Authorization: `Bearer ${sessionToken}` },
        },
      );
      // Parse and ensure proper data types
      const schedules = response.data.schedules.map((schedule: any) => ({
        ...schedule,
        is_closed: Boolean(schedule.is_closed),
      }));
      return schedules;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch schedules",
      );
    }
  },
);

export const updateSchedule = createAsyncThunk(
  "adminSettings/updateSchedule",
  async (
    { id, updates }: { id: number; updates: Partial<ClubSchedule> },
    { rejectWithValue },
  ) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.put(`/api/admin/schedules/${id}`, updates, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return { id, updates };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update schedule",
      );
    }
  },
);

export const updateClubSettings = createAsyncThunk(
  "adminSettings/updateClubSettings",
  async (
    {
      club_id,
      price_per_hour,
      default_booking_duration,
    }: {
      club_id: number;
      price_per_hour?: number;
      default_booking_duration?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.put(
        "/api/admin/club-settings",
        { club_id, price_per_hour, default_booking_duration },
        {
          headers: { Authorization: `Bearer ${sessionToken}` },
        },
      );
      return { price_per_hour, default_booking_duration };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update club settings",
      );
    }
  },
);

export const getCourts = createAsyncThunk(
  "adminSettings/getCourts",
  async (clubId: number, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.get(`/api/admin/courts?club_id=${clubId}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courts",
      );
    }
  },
);

// Fee Structure async thunks
export const getFeeStructure = createAsyncThunk(
  "adminSettings/getFeeStructure",
  async (_, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.get("/api/admin/fee-structure", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch fee structure",
      );
    }
  },
);

export const updateFeeStructure = createAsyncThunk(
  "adminSettings/updateFeeStructure",
  async (
    {
      fee_structure,
      service_fee_percentage,
      terms_accepted,
    }: {
      fee_structure: "user_pays_fee" | "shared_fee" | "club_absorbs_fee";
      service_fee_percentage?: number;
      terms_accepted?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.put(
        "/api/admin/fee-structure",
        { fee_structure, service_fee_percentage, terms_accepted },
        {
          headers: { Authorization: `Bearer ${sessionToken}` },
        },
      );
      return response.data.data;
    } catch (error: any) {
      // Check if terms acceptance is required
      if (error.response?.data?.requires_terms_acceptance) {
        return rejectWithValue({
          message: error.response.data.message,
          requires_terms_acceptance: true,
        });
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to update fee structure",
      );
    }
  },
);

const adminSettingsSlice = createSlice({
  name: "adminSettings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setBasePrice: (state, action) => {
      state.basePrice = action.payload;
    },
    setDefaultDuration: (state, action) => {
      state.defaultDuration = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Price Rules
    builder
      .addCase(getPriceRules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPriceRules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.priceRules = action.payload;
      })
      .addCase(getPriceRules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Price Rule
    builder
      .addCase(createPriceRule.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createPriceRule.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(createPriceRule.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Update Price Rule
    builder
      .addCase(updatePriceRule.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updatePriceRule.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(updatePriceRule.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Delete Price Rule
    builder
      .addCase(deletePriceRule.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deletePriceRule.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.priceRules = state.priceRules.filter(
          (rule) => rule.id !== action.payload,
        );
      })
      .addCase(deletePriceRule.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Get Schedules
    builder
      .addCase(getSchedules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSchedules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules = action.payload;
      })
      .addCase(getSchedules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Schedule
    builder
      .addCase(updateSchedule.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const { id, updates } = action.payload;
        const index = state.schedules.findIndex((s) => s.id === id);
        if (index !== -1) {
          state.schedules[index] = { ...state.schedules[index], ...updates };
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Update Club Settings
    builder
      .addCase(updateClubSettings.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateClubSettings.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload.price_per_hour !== undefined) {
          state.basePrice = action.payload.price_per_hour;
        }
        if (action.payload.default_booking_duration !== undefined) {
          state.defaultDuration = action.payload.default_booking_duration;
        }
      })
      .addCase(updateClubSettings.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Get Courts
    builder
      .addCase(getCourts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courts = action.payload;
      })
      .addCase(getCourts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Fee Structure
    builder
      .addCase(getFeeStructure.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeeStructure.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feeStructure = action.payload;
      })
      .addCase(getFeeStructure.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Fee Structure
    builder
      .addCase(updateFeeStructure.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateFeeStructure.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.feeStructure = action.payload;
      })
      .addCase(updateFeeStructure.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setBasePrice, setDefaultDuration } =
  adminSettingsSlice.actions;
export default adminSettingsSlice.reducer;
