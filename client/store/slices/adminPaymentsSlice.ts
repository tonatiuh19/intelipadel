import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Payment {
  id: number;
  payment_type:
    | "booking"
    | "event"
    | "private_class"
    | "subscription"
    | "other";
  amount: string | number; // MySQL DECIMAL returns string
  currency: string;
  status: "succeeded" | "completed" | "pending" | "failed" | "refunded";
  stripe_payment_intent_id: string;
  stripe_payment_method_id?: string;
  stripe_charge_id?: string;
  user_id: number;
  user_name: string;
  user_email: string;
  booking_number?: string;
  registration_number?: string;
  description: string;
  created_at: string;
  refunded_at?: string | null;
  refund_amount?: string | number | null; // MySQL DECIMAL returns string
  metadata?: any;
  booking_id?: number | null;
  event_registration_id?: number | null;
  private_class_id?: number | null;
  user_subscription_id?: number | null;
}

export interface PaymentStats {
  total_revenue: number | string;
  total_bookings: number | string;
  total_events: number | string;
  total_classes: number | string;
  total_subscriptions: number | string;
  pending_amount: number | string;
  refunded_amount: number | string;
}

interface AdminPaymentsState {
  payments: Payment[];
  stats: PaymentStats | null;
  loading: boolean;
  error: string | null;
  filters: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
}

const initialState: AdminPaymentsState = {
  payments: [],
  stats: null,
  loading: false,
  error: null,
  filters: {},
};

// Fetch all payments
export const fetchAdminPayments = createAsyncThunk(
  "adminPayments/fetchPayments",
  async (
    filters: {
      type?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const adminToken = localStorage.getItem("adminSessionToken");
      if (!adminToken) {
        throw new Error("No admin session found");
      }

      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/admin/payments?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch payments");
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Fetch payment statistics
export const fetchPaymentStats = createAsyncThunk(
  "adminPayments/fetchStats",
  async (clubId: number, { rejectWithValue }) => {
    try {
      const adminToken = localStorage.getItem("adminSessionToken");
      if (!adminToken) {
        throw new Error("No admin session found");
      }

      const response = await fetch(`/api/admin/payments/stats`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch stats");
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Refund a payment
export const refundPayment = createAsyncThunk(
  "adminPayments/refund",
  async (
    {
      paymentId,
      amount,
      reason,
    }: { paymentId: number; amount?: number; reason?: string },
    { rejectWithValue },
  ) => {
    try {
      const adminToken = localStorage.getItem("adminSessionToken");
      if (!adminToken) {
        throw new Error("No admin session found");
      }

      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ amount, reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to refund payment");
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Sync with Stripe
export const syncWithStripe = createAsyncThunk(
  "adminPayments/syncStripe",
  async (paymentIntentId: string, { rejectWithValue }) => {
    try {
      const adminToken = localStorage.getItem("adminSessionToken");
      if (!adminToken) {
        throw new Error("No admin session found");
      }

      const response = await fetch(`/api/admin/payments/sync-stripe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync with Stripe");
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const adminPaymentsSlice = createSlice({
  name: "adminPayments",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<AdminPaymentsState["filters"]>,
    ) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    // Fetch payments
    builder.addCase(fetchAdminPayments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminPayments.fulfilled, (state, action) => {
      state.loading = false;
      state.payments = action.payload;
    });
    builder.addCase(fetchAdminPayments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch stats
    builder.addCase(fetchPaymentStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentStats.fulfilled, (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    });
    builder.addCase(fetchPaymentStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Refund payment
    builder.addCase(refundPayment.fulfilled, (state, action) => {
      const index = state.payments.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
    });

    // Sync with Stripe
    builder.addCase(syncWithStripe.fulfilled, (state, action) => {
      const index = state.payments.findIndex(
        (p) =>
          p.stripe_payment_intent_id ===
          action.payload.stripe_payment_intent_id,
      );
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
    });
  },
});

export const { setFilters, clearFilters } = adminPaymentsSlice.actions;
export default adminPaymentsSlice.reducer;
