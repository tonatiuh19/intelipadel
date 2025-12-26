import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Booking, CreateBookingData } from "@shared/types";

interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  loading: false,
  error: null,
};

// Async thunk for creating a booking
export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (bookingData: CreateBookingData) => {
    const response = await axios.post("/api/bookings", bookingData);
    return response.data;
  },
);

// Async thunk for fetching bookings
export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (userId: number) => {
    const response = await axios.get(`/api/bookings?userId=${userId}`);
    return response.data;
  },
);

// Async thunk for cancelling a booking
export const cancelBooking = createAsyncThunk(
  "bookings/cancelBooking",
  async ({
    bookingId,
    userId,
    cancellationReason,
  }: {
    bookingId: number;
    userId: number;
    cancellationReason?: string;
  }) => {
    const response = await axios.post(`/api/bookings/${bookingId}/cancel`, {
      user_id: userId,
      cancellation_reason: cancellationReason,
    });
    return { ...response.data, bookingId };
  },
);

// Async thunk for requesting an invoice
export const requestInvoice = createAsyncThunk(
  "bookings/requestInvoice",
  async ({ bookingId, userId }: { bookingId: number; userId: number }) => {
    const response = await axios.post(
      `/api/bookings/${bookingId}/request-invoice`,
      {
        user_id: userId,
      },
    );
    return { ...response.data, bookingId };
  },
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create booking";
      })
      // Fetch bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data || action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch bookings";
      })
      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Update the booking status in state
        const booking = state.bookings.find(
          (b: any) => b.id === action.payload.bookingId,
        );
        if (booking) {
          (booking as any).status = "cancelled";
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to cancel booking";
      })
      // Request invoice
      .addCase(requestInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestInvoice.fulfilled, (state, action) => {
        state.loading = false;
        // Update the factura_requested flag in state
        const booking = state.bookings.find(
          (b: any) => b.id === action.payload.bookingId,
        );
        if (booking) {
          (booking as any).factura_requested = 1;
        }
      })
      .addCase(requestInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to request invoice";
      });
  },
});

export const { clearError } = bookingsSlice.actions;
export default bookingsSlice.reducer;
