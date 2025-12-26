import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface PolicyData {
  id: number;
  club_id: number;
  version: string;
  content: string;
  effective_date: string;
  created_at: string;
  updated_at: string;
  hours_before_cancellation?: number;
  refund_percentage?: number;
}

interface ClubPoliciesState {
  policy: PolicyData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClubPoliciesState = {
  policy: null,
  loading: false,
  error: null,
};

// Async thunk to fetch club policy
export const fetchClubPolicy = createAsyncThunk(
  "clubPolicies/fetchPolicy",
  async (
    {
      clubId,
      policyType,
    }: { clubId: number; policyType: "terms" | "privacy" | "cancellation" },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.get(
        `/api/clubs/${clubId}/policies/${policyType}`,
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch policy",
      );
    }
  },
);

const clubPoliciesSlice = createSlice({
  name: "clubPolicies",
  initialState,
  reducers: {
    clearPolicy: (state) => {
      state.policy = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClubPolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClubPolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policy = action.payload;
        state.error = null;
      })
      .addCase(fetchClubPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPolicy } = clubPoliciesSlice.actions;
export default clubPoliciesSlice.reducer;
