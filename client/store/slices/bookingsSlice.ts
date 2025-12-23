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
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch bookings";
      });
  },
});

export const { clearError } = bookingsSlice.actions;
export default bookingsSlice.reducer;
