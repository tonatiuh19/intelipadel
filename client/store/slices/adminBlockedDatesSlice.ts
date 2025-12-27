import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface BlockedSlot {
  id: number;
  club_id: number;
  court_id: number | null;
  block_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string;
  block_type: string;
  created_at: string;
  is_all_day?: boolean;
  club_name?: string;
  court_name?: string;
}

interface AdminBlockedDatesState {
  blockedSlots: BlockedSlot[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: AdminBlockedDatesState = {
  blockedSlots: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const getBlockedSlots = createAsyncThunk(
  "adminBlockedDates/getSlots",
  async (_, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.get("/api/admin/blocked-slots", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch blocked slots",
      );
    }
  },
);

interface CreateBlockedSlotData {
  club_id: number;
  court_id: number | null;
  block_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string;
  block_type: string;
}

export const createBlockedSlot = createAsyncThunk(
  "adminBlockedDates/createSlot",
  async (data: CreateBlockedSlotData, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.post("/api/admin/blocked-slots", data, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create blocked slot",
      );
    }
  },
);

export const deleteBlockedSlot = createAsyncThunk(
  "adminBlockedDates/deleteSlot",
  async (id: number, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      await axios.delete(`/api/admin/blocked-slots/${id}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete blocked slot",
      );
    }
  },
);

const adminBlockedDatesSlice = createSlice({
  name: "adminBlockedDates",
  initialState,
  reducers: {
    clearBlockedDatesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Blocked Slots
      .addCase(getBlockedSlots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBlockedSlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blockedSlots = action.payload;
      })
      .addCase(getBlockedSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Blocked Slot
      .addCase(createBlockedSlot.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createBlockedSlot.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.blockedSlots.push(action.payload);
      })
      .addCase(createBlockedSlot.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Delete Blocked Slot
      .addCase(deleteBlockedSlot.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteBlockedSlot.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.blockedSlots = state.blockedSlots.filter(
          (slot) => slot.id !== action.payload,
        );
      })
      .addCase(deleteBlockedSlot.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBlockedDatesError } = adminBlockedDatesSlice.actions;
export default adminBlockedDatesSlice.reducer;
