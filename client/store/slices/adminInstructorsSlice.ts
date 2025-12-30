import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Instructor {
  id: number;
  club_id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  specialties?: string; // Database stores as TEXT (comma-separated string)
  years_of_experience?: number;
  rating?: number;
  hourly_rate: number;
  profile_image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  club_name?: string;
}

interface AdminInstructorsState {
  instructors: Instructor[];
  loading: boolean;
  error: string | null;
  selectedInstructor: Instructor | null;
}

const initialState: AdminInstructorsState = {
  instructors: [],
  loading: false,
  error: null,
  selectedInstructor: null,
};

// Fetch all instructors for admin's club
export const fetchAdminInstructors = createAsyncThunk(
  "adminInstructors/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const adminSessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.get("/api/admin/instructors", {
        headers: {
          Authorization: `Bearer ${adminSessionToken}`,
        },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch instructors",
      );
    }
  },
);

// Create new instructor
export const createAdminInstructor = createAsyncThunk(
  "adminInstructors/create",
  async (instructorData: Partial<Instructor>, { rejectWithValue }) => {
    try {
      const adminSessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.post(
        "/api/admin/instructors",
        instructorData,
        {
          headers: {
            Authorization: `Bearer ${adminSessionToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create instructor",
      );
    }
  },
);

// Update instructor
export const updateAdminInstructor = createAsyncThunk(
  "adminInstructors/update",
  async (
    { id, data }: { id: number; data: Partial<Instructor> },
    { rejectWithValue },
  ) => {
    try {
      const adminSessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.put(`/api/admin/instructors/${id}`, data, {
        headers: {
          Authorization: `Bearer ${adminSessionToken}`,
          "Content-Type": "application/json",
        },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update instructor",
      );
    }
  },
);

// Delete instructor
export const deleteAdminInstructor = createAsyncThunk(
  "adminInstructors/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const adminSessionToken = localStorage.getItem("adminSessionToken");
      await axios.delete(`/api/admin/instructors/${id}`, {
        headers: {
          Authorization: `Bearer ${adminSessionToken}`,
        },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete instructor",
      );
    }
  },
);

const adminInstructorsSlice = createSlice({
  name: "adminInstructors",
  initialState,
  reducers: {
    setSelectedInstructor: (state, action) => {
      state.selectedInstructor = action.payload;
    },
    clearSelectedInstructor: (state) => {
      state.selectedInstructor = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch instructors
    builder
      .addCase(fetchAdminInstructors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminInstructors.fulfilled, (state, action) => {
        state.loading = false;
        state.instructors = action.payload;
      })
      .addCase(fetchAdminInstructors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create instructor
      .addCase(createAdminInstructor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminInstructor.fulfilled, (state, action) => {
        state.loading = false;
        state.instructors.push(action.payload);
      })
      .addCase(createAdminInstructor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update instructor
      .addCase(updateAdminInstructor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminInstructor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.instructors.findIndex(
          (i) => i.id === action.payload.id,
        );
        if (index !== -1) {
          state.instructors[index] = action.payload;
        }
      })
      .addCase(updateAdminInstructor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete instructor
      .addCase(deleteAdminInstructor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminInstructor.fulfilled, (state, action) => {
        state.loading = false;
        state.instructors = state.instructors.filter(
          (i) => i.id !== action.payload,
        );
      })
      .addCase(deleteAdminInstructor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedInstructor, clearSelectedInstructor } =
  adminInstructorsSlice.actions;
export default adminInstructorsSlice.reducer;
