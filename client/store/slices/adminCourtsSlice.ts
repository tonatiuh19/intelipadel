import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Court {
  id: number;
  club_id: number;
  name: string;
  court_type: string;
  is_active: boolean;
  created_at: string;
  club_name?: string;
}

interface AdminCourtsState {
  courts: Court[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: AdminCourtsState = {
  courts: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const getAdminCourts = createAsyncThunk(
  "adminCourts/getCourts",
  async (_, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.get("/api/admin/courts", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch courts",
      );
    }
  },
);

interface CreateCourtData {
  club_id: number;
  name: string;
  type: string;
  is_active: boolean;
}

export const createAdminCourt = createAsyncThunk(
  "adminCourts/createCourt",
  async (data: CreateCourtData, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.post("/api/admin/courts", data, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create court",
      );
    }
  },
);

interface UpdateCourtData {
  id: number;
  club_id: number;
  name: string;
  type: string;
  is_active: boolean;
}

export const updateAdminCourt = createAsyncThunk(
  "adminCourts/updateCourt",
  async (data: UpdateCourtData, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.put(`/api/admin/courts/${data.id}`, data, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update court",
      );
    }
  },
);

const adminCourtsSlice = createSlice({
  name: "adminCourts",
  initialState,
  reducers: {
    clearCourtsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Courts
      .addCase(getAdminCourts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminCourts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courts = action.payload;
      })
      .addCase(getAdminCourts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Court
      .addCase(createAdminCourt.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createAdminCourt.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.courts.push(action.payload);
      })
      .addCase(createAdminCourt.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Update Court
      .addCase(updateAdminCourt.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateAdminCourt.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.courts.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.courts[index] = action.payload;
        }
      })
      .addCase(updateAdminCourt.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCourtsError } = adminCourtsSlice.actions;
export default adminCourtsSlice.reducer;
