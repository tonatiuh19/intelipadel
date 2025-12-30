import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface ClassPaymentState {
  clientSecret: string | null;
  paymentIntentId: string | null;
  transactionId: number | null;
  loading: boolean;
  error: string | null;
  bookingComplete: boolean;
  bookingNumber: string | null;
}

const initialState: ClassPaymentState = {
  clientSecret: null,
  paymentIntentId: null,
  transactionId: null,
  loading: false,
  error: null,
  bookingComplete: false,
  bookingNumber: null,
};

export const createClassPaymentIntent = createAsyncThunk(
  "classPayment/createIntent",
  async (
    data: {
      user_id: number;
      instructor_id: number;
      club_id: number;
      court_id?: number;
      class_type: string;
      class_date: string;
      start_time: string;
      end_time: string;
      duration_minutes: number;
      number_of_students?: number;
      total_price: number;
      focus_areas?: string[];
      student_level?: string;
      notes?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        "/api/private-classes/payment/create-intent",
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

export const confirmClassPayment = createAsyncThunk(
  "classPayment/confirm",
  async (
    data: {
      payment_intent_id: string;
      user_id: number;
      instructor_id: number;
      club_id: number;
      court_id?: number;
      class_type: string;
      class_date: string;
      start_time: string;
      end_time: string;
      duration_minutes: number;
      number_of_students?: number;
      total_price: number;
      focus_areas?: string[];
      student_level?: string;
      notes?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        "/api/private-classes/payment/confirm",
        data,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to confirm payment",
      );
    }
  },
);

const classPaymentSlice = createSlice({
  name: "classPayment",
  initialState,
  reducers: {
    resetClassPayment: (state) => {
      state.clientSecret = null;
      state.paymentIntentId = null;
      state.transactionId = null;
      state.loading = false;
      state.error = null;
      state.bookingComplete = false;
      state.bookingNumber = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create payment intent
      .addCase(createClassPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClassPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
        state.paymentIntentId = action.payload.paymentIntentId;
        state.transactionId = action.payload.transactionId;
      })
      .addCase(createClassPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Confirm payment
      .addCase(confirmClassPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmClassPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingComplete = true;
        state.bookingNumber = action.payload.data.bookingNumber;
      })
      .addCase(confirmClassPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetClassPayment } = classPaymentSlice.actions;
export default classPaymentSlice.reducer;
