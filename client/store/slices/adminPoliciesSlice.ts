import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface AdminPoliciesState {
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AdminPoliciesState = {
  isSubmitting: false,
  error: null,
  successMessage: null,
};

interface UpdatePolicyData {
  club_id: number;
  policy_type: string;
  content: string;
}

export const updateClubPolicy = createAsyncThunk(
  "adminPolicies/updatePolicy",
  async (data: UpdatePolicyData, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.put("/api/admin/club-policies", data, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.message;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update policy",
      );
    }
  },
);

const adminPoliciesSlice = createSlice({
  name: "adminPolicies",
  initialState,
  reducers: {
    clearPoliciesError: (state) => {
      state.error = null;
    },
    clearPoliciesSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateClubPolicy.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateClubPolicy.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = action.payload;
      })
      .addCase(updateClubPolicy.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPoliciesError, clearPoliciesSuccess } =
  adminPoliciesSlice.actions;
export default adminPoliciesSlice.reducer;
