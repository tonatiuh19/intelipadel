import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalPlayers: number;
  upcomingBookings: number;
}

interface RecentBooking {
  id: number;
  booking_date: string;
  start_time: string;
  user_name: string;
  club_name: string;
  court_name: string;
  total_price: number;
  status: string;
}

interface AdminDashboardState {
  stats: DashboardStats | null;
  recentBookings: RecentBooking[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminDashboardState = {
  stats: null,
  recentBookings: [],
  isLoading: false,
  error: null,
};

export const getDashboardStats = createAsyncThunk(
  "adminDashboard/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.get("/api/admin/dashboard/stats", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch dashboard stats",
      );
    }
  },
);

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.recentBookings = action.payload.recentBookings;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
