import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Booking {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  total_price: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  club_name: string;
  court_name: string;
}

interface AdminBookingsState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminBookingsState = {
  bookings: [],
  isLoading: false,
  error: null,
};

interface GetBookingsParams {
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const getAdminBookings = createAsyncThunk(
  "adminBookings/getBookings",
  async (params: GetBookingsParams, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      console.log(
        "📡 Fetching admin bookings with token:",
        sessionToken?.substring(0, 20) + "...",
      );
      console.log("📡 Request params:", params);

      const response = await axios.get("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${sessionToken}` },
        params,
      });

      console.log("✅ Bookings response:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error(
        "❌ Bookings error:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch bookings",
      );
    }
  },
);

const adminBookingsSlice = createSlice({
  name: "adminBookings",
  initialState,
  reducers: {
    clearBookingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(getAdminBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBookingsError } = adminBookingsSlice.actions;
export default adminBookingsSlice.reducer;
