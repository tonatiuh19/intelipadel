import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Admin {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  club_id: number | null;
  is_active: boolean;
  created_at: string;
  club_name?: string;
}

interface AdminUsersState {
  admins: Admin[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: AdminUsersState = {
  admins: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const getAdmins = createAsyncThunk(
  "adminUsers/getAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.get("/api/admin/admins", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch admins",
      );
    }
  },
);

interface CreateAdminData {
  email: string;
  name: string;
  role: string;
  club_id: number | null;
}

export const createAdmin = createAsyncThunk(
  "adminUsers/createAdmin",
  async (data: CreateAdminData, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.post("/api/admin/admins", data, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create admin",
      );
    }
  },
);

interface UpdateAdminData {
  id: number;
  name: string;
  role: string;
  club_id: number | null;
  is_active: boolean;
}

export const updateAdmin = createAsyncThunk(
  "adminUsers/updateAdmin",
  async (data: UpdateAdminData, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.put(`/api/admin/admins/${data.id}`, data, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update admin",
      );
    }
  },
);

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    clearAdminUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Admins
      .addCase(getAdmins.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdmins.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admins = action.payload;
      })
      .addCase(getAdmins.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Admin
      .addCase(createAdmin.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.admins.push(action.payload);
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Update Admin
      .addCase(updateAdmin.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.admins.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminUsersError } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
