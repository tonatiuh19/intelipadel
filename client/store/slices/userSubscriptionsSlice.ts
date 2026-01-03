import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  UserSubscription,
  PaymentMethod,
  ClubSubscription,
} from "@shared/types";

interface UserSubscriptionsState {
  userSubscription: UserSubscription | null;
  paymentMethods: PaymentMethod[];
  availableSubscriptions: ClubSubscription[];
  loading: boolean;
  error: string | null;
}

const initialState: UserSubscriptionsState = {
  userSubscription: null,
  paymentMethods: [],
  availableSubscriptions: [],
  loading: false,
  error: null,
};

// Fetch user subscription with details
export const fetchUserSubscription = createAsyncThunk(
  "userSubscriptions/fetchUserSubscription",
  async (userId: number) => {
    const response = await axios.get(`/api/users/${userId}/subscription`);
    return response.data;
  },
);

// Fetch payment methods
export const fetchPaymentMethods = createAsyncThunk(
  "userSubscriptions/fetchPaymentMethods",
  async (userId: number) => {
    const response = await axios.get(`/api/users/${userId}/payment-methods`);
    return response.data;
  },
);

// Fetch available subscriptions for a club
export const fetchAvailableSubscriptions = createAsyncThunk(
  "userSubscriptions/fetchAvailableSubscriptions",
  async (clubId: number) => {
    const response = await axios.get(`/api/subscriptions/active/${clubId}`);
    return response.data;
  },
);

// Subscribe to a subscription
export const subscribe = createAsyncThunk(
  "userSubscriptions/subscribe",
  async (data: {
    userId: number;
    subscriptionId: number;
    paymentMethodId: string;
  }) => {
    const response = await axios.post("/api/subscriptions/subscribe", {
      user_id: data.userId,
      subscription_id: data.subscriptionId,
      payment_method_id: data.paymentMethodId,
    });
    return response.data;
  },
);

// Cancel subscription
export const cancelSubscription = createAsyncThunk(
  "userSubscriptions/cancelSubscription",
  async (data: { userId: number; subscriptionId: number }) => {
    const response = await axios.post("/api/subscriptions/cancel", {
      user_id: data.userId,
      subscription_id: data.subscriptionId,
    });
    return response.data;
  },
);

// Delete payment method
export const deletePaymentMethod = createAsyncThunk(
  "userSubscriptions/deletePaymentMethod",
  async (paymentMethodId: string) => {
    await axios.delete(`/api/payment-methods/${paymentMethodId}`);
    return paymentMethodId;
  },
);

const userSubscriptionsSlice = createSlice({
  name: "userSubscriptions",
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    clearAvailableSubscriptions: (state) => {
      state.availableSubscriptions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user subscription
      .addCase(fetchUserSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSubscription.fulfilled, (state, action) => {
        state.userSubscription = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch subscription";
      })
      // Fetch payment methods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = action.payload;
        state.loading = false;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch payment methods";
      })
      // Fetch available subscriptions
      .addCase(fetchAvailableSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSubscriptions.fulfilled, (state, action) => {
        state.availableSubscriptions = action.payload;
        state.loading = false;
      })
      .addCase(fetchAvailableSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch subscriptions";
      })
      // Subscribe
      .addCase(subscribe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribe.fulfilled, (state, action) => {
        state.userSubscription = action.payload;
        state.loading = false;
      })
      .addCase(subscribe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to subscribe";
      })
      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.userSubscription = null;
        state.loading = false;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to cancel subscription";
      })
      // Delete payment method
      .addCase(deletePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods = state.paymentMethods.filter(
          (pm) => pm.stripe_payment_method_id !== action.payload,
        );
        state.loading = false;
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete payment method";
      });
  },
});

export const { clearSubscriptionError, clearAvailableSubscriptions } =
  userSubscriptionsSlice.actions;
export default userSubscriptionsSlice.reducer;
