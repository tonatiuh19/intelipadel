import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Instructor {
  id: number;
  club_id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  specialties?: string[];
  hourly_rate: number;
  avatar_url?: string;
  rating?: number;
  review_count?: number;
  is_active: boolean;
}

interface InstructorsState {
  instructors: Instructor[];
  loading: boolean;
  error: string | null;
}

const initialState: InstructorsState = {
  instructors: [],
  loading: false,
  error: null,
};

// Async thunk for fetching instructors by club and optional date
export const fetchInstructors = createAsyncThunk(
  "instructors/fetchInstructors",
  async ({ clubId, date }: { clubId: number; date?: string }) => {
    const url = date
      ? `/api/instructors/${clubId}?date=${date}`
      : `/api/instructors/${clubId}`;
    const response = await axios.get(url);
    return response.data.data;
  },
);

const instructorsSlice = createSlice({
  name: "instructors",
  initialState,
  reducers: {
    clearInstructors: (state) => {
      state.instructors = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstructors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstructors.fulfilled, (state, action) => {
        state.loading = false;
        state.instructors = action.payload;
      })
      .addCase(fetchInstructors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch instructors";
      });
  },
});

export const { clearInstructors } = instructorsSlice.actions;
export default instructorsSlice.reducer;
