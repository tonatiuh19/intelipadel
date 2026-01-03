import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  ClubSubscription,
  CreateSubscriptionData,
  UpdateSubscriptionData,
} from "@shared/types";

interface SubscriptionsState {
  subscriptions: ClubSubscription[];
  selectedSubscription: ClubSubscription | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionsState = {
  subscriptions: [],
  selectedSubscription: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchSubscriptions",
  async (clubId: number) => {
    const response = await axios.get(`/api/subscriptions?club_id=${clubId}`);
    return response.data;
  },
);

export const createSubscription = createAsyncThunk(
  "subscriptions/createSubscription",
  async (data: CreateSubscriptionData) => {
    const sessionToken = localStorage.getItem("adminSessionToken");
    const response = await axios.post("/api/subscriptions", data, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    return response.data;
  },
);

export const updateSubscription = createAsyncThunk(
  "subscriptions/updateSubscription",
  async ({ id, ...data }: UpdateSubscriptionData) => {
    const sessionToken = localStorage.getItem("adminSessionToken");
    const response = await axios.put(`/api/subscriptions/${id}`, data, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    return response.data;
  },
);

export const deleteSubscription = createAsyncThunk(
  "subscriptions/deleteSubscription",
  async (id: number) => {
    const sessionToken = localStorage.getItem("adminSessionToken");
    await axios.delete(`/api/subscriptions/${id}`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    return id;
  },
);

const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    selectSubscription: (
      state,
      action: PayloadAction<ClubSubscription | null>,
    ) => {
      state.selectedSubscription = action.payload;
    },
    clearSelectedSubscription: (state) => {
      state.selectedSubscription = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch subscriptions";
      })
      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions.push(action.payload);
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create subscription";
      })
      // Update subscription
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subscriptions.findIndex(
          (sub) => sub.id === action.payload.id,
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update subscription";
      })
      // Delete subscription
      .addCase(deleteSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = state.subscriptions.filter(
          (sub) => sub.id !== action.payload,
        );
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete subscription";
      });
  },
});

export const { selectSubscription, clearSelectedSubscription, clearError } =
  subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
