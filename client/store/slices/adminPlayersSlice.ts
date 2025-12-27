import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Player {
  id: number;
  name: string;
  email: string;
  phone: string;
  total_bookings: number;
  total_spent: number;
  created_at: string;
  is_active: boolean;
}

interface AdminPlayersState {
  players: Player[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminPlayersState = {
  players: [],
  isLoading: false,
  error: null,
};

export const getAdminPlayers = createAsyncThunk(
  "adminPlayers/getPlayers",
  async (_, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.get("/api/admin/players", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch players",
      );
    }
  },
);

const adminPlayersSlice = createSlice({
  name: "adminPlayers",
  initialState,
  reducers: {
    clearPlayersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAdminPlayers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminPlayers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.players = action.payload;
      })
      .addCase(getAdminPlayers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPlayersError } = adminPlayersSlice.actions;
export default adminPlayersSlice.reducer;
