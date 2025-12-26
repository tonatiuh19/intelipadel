import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface PaymentState {
  clientSecret: string | null;
  paymentIntentId: string | null;
  transactionId: number | null;
  status: "idle" | "processing" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  clientSecret: null,
  paymentIntentId: null,
  transactionId: null,
  status: "idle",
  loading: false,
  error: null,
};

/**
 * Create payment intent for booking
 */
export const createPaymentIntent = createAsyncThunk(
  "payment/createIntent",
  async (
    bookingData: {
      user_id: number;
      club_id: number;
      court_id: number;
      booking_date: string;
      start_time: string;
      end_time: string;
      duration_minutes: number;
      total_price: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        "/api/payment/create-intent",
        bookingData,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create payment intent",
      );
    }
  },
);

/**
 * Confirm payment and create booking
 */
export const confirmPayment = createAsyncThunk(
  "payment/confirm",
  async (
    {
      paymentIntentId,
      bookingData,
    }: {
      paymentIntentId: string;
      bookingData: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post("/api/payment/confirm", {
        payment_intent_id: paymentIntentId,
        ...bookingData,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to confirm payment",
      );
    }
  },
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPayment: (state) => {
      state.clientSecret = null;
      state.paymentIntentId = null;
      state.transactionId = null;
      state.status = "idle";
      state.error = null;
      state.loading = false;
    },
    setPaymentStatus: (
      state,
      action: PayloadAction<"idle" | "processing" | "succeeded" | "failed">,
    ) => {
      state.status = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Payment Intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
        state.paymentIntentId = action.payload.paymentIntentId;
        state.transactionId = action.payload.transactionId;
        state.status = "idle";
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.status = "failed";
      });

    // Confirm Payment
    builder
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true;
        state.status = "processing";
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.status = "failed";
      });
  },
});

export const { resetPayment, setPaymentStatus, clearError } =
  paymentSlice.actions;
export default paymentSlice.reducer;
