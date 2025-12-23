import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Club } from "@shared/types";

interface ClubsState {
  clubs: Club[];
  selectedClub: Club | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClubsState = {
  clubs: [],
  selectedClub: null,
  loading: false,
  error: null,
};

// Async thunk for fetching clubs
export const fetchClubs = createAsyncThunk("clubs/fetchClubs", async () => {
  const response = await axios.get("/api/clubs");
  return response.data.data; // Extract the data array from the response
});

const clubsSlice = createSlice({
  name: "clubs",
  initialState,
  reducers: {
    selectClub: (state, action: PayloadAction<Club | null>) => {
      state.selectedClub = action.payload;
    },
    clearSelectedClub: (state) => {
      state.selectedClub = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClubs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClubs.fulfilled, (state, action) => {
        state.loading = false;
        state.clubs = action.payload;
      })
      .addCase(fetchClubs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch clubs";
      });
  },
});

export const { selectClub, clearSelectedClub } = clubsSlice.actions;
export default clubsSlice.reducer;
