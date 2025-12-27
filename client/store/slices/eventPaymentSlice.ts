import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface EventPaymentState {
  clientSecret: string | null;
  paymentIntentId: string | null;
  transactionId: number | null;
  loading: boolean;
  error: string | null;
  registrationComplete: boolean;
  registrationNumber: string | null;
}

const initialState: EventPaymentState = {
  clientSecret: null,
  paymentIntentId: null,
  transactionId: null,
  loading: false,
  error: null,
  registrationComplete: false,
  registrationNumber: null,
};

export const createEventPaymentIntent = createAsyncThunk(
  "eventPayment/createIntent",
  async (
    data: { user_id: number; event_id: number; registration_fee: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        "/api/events/payment/create-intent",
        data,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create payment intent",
      );
    }
  },
);

export const confirmEventPayment = createAsyncThunk(
  "eventPayment/confirm",
  async (
    data: {
      payment_intent_id: string;
      user_id: number;
      event_id: number;
      registration_fee: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post("/api/events/payment/confirm", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to confirm payment",
      );
    }
  },
);

const eventPaymentSlice = createSlice({
  name: "eventPayment",
  initialState,
  reducers: {
    resetEventPayment: (state) => {
      state.clientSecret = null;
      state.paymentIntentId = null;
      state.transactionId = null;
      state.loading = false;
      state.error = null;
      state.registrationComplete = false;
      state.registrationNumber = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create payment intent
      .addCase(createEventPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEventPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
        state.paymentIntentId = action.payload.paymentIntentId;
        state.transactionId = action.payload.transactionId;
      })
      .addCase(createEventPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Confirm payment
      .addCase(confirmEventPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmEventPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationComplete = true;
        state.registrationNumber = action.payload.data.registrationNumber;
      })
      .addCase(confirmEventPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetEventPayment } = eventPaymentSlice.actions;
export default eventPaymentSlice.reducer;
