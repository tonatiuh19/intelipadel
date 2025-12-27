import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Admin user type
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: "super_admin" | "club_admin";
  club_id: number | null;
  club_name: string | null;
  club_logo: string | null;
  is_active: boolean;
}

// Admin auth state
interface AdminAuthState {
  admin: AdminUser | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  verificationEmail: string | null;
}

const initialState: AdminAuthState = {
  admin: null,
  sessionToken: localStorage.getItem("adminSessionToken"),
  isAuthenticated: !!localStorage.getItem("adminSessionToken"),
  isLoading: false,
  error: null,
  verificationEmail: null,
};

// Async thunks for admin authentication

// Send verification code to admin email
export const sendAdminVerificationCode = createAsyncThunk(
  "adminAuth/sendCode",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log("📤 Redux: Sending admin verification code to:", email);
      const response = await axios.post("/api/admin/auth/send-code", { email });
      console.log("✅ Redux: Code sent response:", response.data);
      return { email, success: response.data.success };
    } catch (error: any) {
      console.error("❌ Redux: Failed to send code:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send verification code",
      );
    }
  },
);

// Verify code and login admin
export const verifyAdminCode = createAsyncThunk(
  "adminAuth/verifyCode",
  async (
    { email, code }: { email: string; code: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post("/api/admin/auth/verify-code", {
        email,
        code,
      });

      const { admin, sessionToken } = response.data;

      console.log(
        "🔑 Received session token:",
        sessionToken?.substring(0, 20) + "...",
      );

      // Store token in localStorage
      localStorage.setItem("adminSessionToken", sessionToken);

      console.log("💾 Token stored in localStorage");
      console.log(
        "✅ Verifying storage:",
        localStorage.getItem("adminSessionToken")?.substring(0, 20) + "...",
      );

      return { admin, sessionToken };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid verification code",
      );
    }
  },
);

// Validate existing session
export const validateAdminSession = createAsyncThunk(
  "adminAuth/validateSession",
  async (_, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");

      console.log("🔍 Validating session, token exists:", !!sessionToken);

      if (!sessionToken) {
        console.log("❌ No session token in localStorage");
        return rejectWithValue("No session token found");
      }

      console.log(
        "📡 Calling /api/admin/auth/validate with token:",
        sessionToken.substring(0, 20) + "...",
      );

      const response = await axios.get("/api/admin/auth/validate", {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      console.log("✅ Session validation successful:", response.data);

      return { admin: response.data.admin, sessionToken };
    } catch (error: any) {
      console.error(
        "❌ Session validation failed:",
        error.response?.data || error.message,
      );
      localStorage.removeItem("adminSessionToken");
      return rejectWithValue(
        error.response?.data?.message || "Session validation failed",
      );
    }
  },
);

// Logout admin
export const logoutAdmin = createAsyncThunk(
  "adminAuth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");

      if (sessionToken) {
        await axios.post(
          "/api/admin/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          },
        );
      }

      localStorage.removeItem("adminSessionToken");
      return null;
    } catch (error: any) {
      // Still clear local session even if API call fails
      localStorage.removeItem("adminSessionToken");
      return null;
    }
  },
);

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearVerificationEmail: (state) => {
      state.verificationEmail = null;
    },
  },
  extraReducers: (builder) => {
    // Send verification code
    builder
      .addCase(sendAdminVerificationCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendAdminVerificationCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.verificationEmail = action.payload.email;
      })
      .addCase(sendAdminVerificationCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify code and login
    builder
      .addCase(verifyAdminCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyAdminCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admin = action.payload.admin;
        state.sessionToken = action.payload.sessionToken;
        state.isAuthenticated = true;
        state.verificationEmail = null;
      })
      .addCase(verifyAdminCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Validate session
    builder
      .addCase(validateAdminSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(validateAdminSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admin = action.payload.admin;
        state.sessionToken = action.payload.sessionToken;
        state.isAuthenticated = true;
      })
      .addCase(validateAdminSession.rejected, (state) => {
        state.isLoading = false;
        state.admin = null;
        state.sessionToken = null;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.admin = null;
        state.sessionToken = null;
        state.isAuthenticated = false;
        state.verificationEmail = null;
      });
  },
});

export const { clearAdminError, clearVerificationEmail } =
  adminAuthSlice.actions;
export default adminAuthSlice.reducer;
