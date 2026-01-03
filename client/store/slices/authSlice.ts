import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { User } from "@shared/types";

interface ClubOption {
  id: number;
  name: string;
  logo_url: string | null;
  user_id: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  // For multi-step auth flow
  authStep:
    | "email"
    | "select-club"
    | "create-user"
    | "verify-code"
    | "complete";
  tempEmail: string | null;
  tempUserId: number | null;
  tempClubId: number | null; // Store club_id during auth flow
  userExists: boolean | null;
  availableClubs: ClubOption[]; // Clubs user belongs to
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  authStep: "email",
  tempEmail: null,
  tempUserId: null,
  tempClubId: null, // Initialize club_id
  userExists: null,
  availableClubs: [],
};

// Load user from localStorage on init
const storedUser = localStorage.getItem("intelipadel_user");
if (storedUser) {
  try {
    const parsed = JSON.parse(storedUser);
    initialState.user = parsed;
    initialState.isAuthenticated = true;
  } catch (e) {
    localStorage.removeItem("intelipadel_user");
  }
}

/**
 * Step 1: Check if user exists
 */
export const checkUser = createAsyncThunk(
  "auth/checkUser",
  async (
    { email, club_id }: { email: string; club_id?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post("/api/auth/check-user", {
        email,
        club_id,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to check user",
      );
    }
  },
);

/**
 * Step 2: Create new user
 */
export const createUser = createAsyncThunk(
  "auth/createUser",
  async (
    userData: {
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      date_of_birth?: string;
      club_id?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post("/api/auth/create-user", userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create user",
      );
    }
  },
);

/**
 * Step 3: Send verification code
 */
export const sendCode = createAsyncThunk(
  "auth/sendCode",
  async (
    { user_id, email }: { user_id: number; email: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post("/api/auth/send-code", {
        user_id,
        email,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send code",
      );
    }
  },
);

/**
 * Step 4: Verify code and login
 */
export const verifyCode = createAsyncThunk(
  "auth/verifyCode",
  async (
    { user_id, code }: { user_id: number; code: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post("/api/auth/verify-code", {
        user_id,
        code,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify code",
      );
    }
  },
);

/**
 * Update user profile
 */
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    userData: {
      userId: number;
      name: string;
      phone?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.put(`/api/users/${userData.userId}`, {
        name: userData.name,
        phone: userData.phone,
        requesting_user_id: userData.userId,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authStep = "email";
      state.tempEmail = null;
      state.tempUserId = null;
      state.tempClubId = null;
      state.userExists = null;
      state.availableClubs = [];
      state.error = null;
      localStorage.removeItem("intelipadel_user");
    },
    resetAuthFlow: (state) => {
      state.authStep = "email";
      state.tempEmail = null;
      state.tempUserId = null;
      state.tempClubId = null;
      state.userExists = null;
      state.availableClubs = [];
      state.error = null;
      state.loading = false;
    },
    setTempClubId: (state, action: PayloadAction<number | null>) => {
      state.tempClubId = action.payload;
    },
    selectClub: (
      state,
      action: PayloadAction<{ clubId: number; userId: number }>,
    ) => {
      state.tempClubId = action.payload.clubId;
      state.tempUserId = action.payload.userId;
      // Proceed to send code
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Check User
    builder
      .addCase(checkUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkUser.fulfilled, (state, action) => {
        state.loading = false;
        const { exists, patient, clubs, error } = action.payload;

        if (error) {
          state.authStep = "email";
          state.error = error;
          return;
        }

        if (exists) {
          state.tempEmail = action.meta.arg.email;
          state.availableClubs = clubs || [];
          state.userExists = true;

          // If patient is provided (single club or club_id match), auto-select
          if (patient) {
            state.tempUserId = patient.id;
            state.tempClubId = patient.club_id || null;
            // Stay on email step, sendCode will be triggered by useEffect
            state.authStep = "email";
          } else if (clubs && clubs.length > 1) {
            // Multiple clubs - show selection
            state.authStep = "select-club";
          } else if (clubs && clubs.length === 1) {
            // Single club - auto-select
            state.tempUserId = clubs[0].user_id;
            state.tempClubId = clubs[0].id;
            state.authStep = "email";
          } else {
            // No clubs found
            state.authStep = "email";
            state.error = "No se encontraron cuentas activas.";
          }
        } else {
          state.tempEmail = action.meta.arg.email;
          state.tempClubId = action.meta.arg.club_id || null;
          state.userExists = false;
          state.authStep = "create-user";
        }
      })
      .addCase(checkUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create User
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        const { data } = action.payload;
        state.tempUserId = data.id;
        state.tempEmail = data.email;
        state.userExists = true;
        state.authStep = "verify-code";
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Send Code
    builder
      .addCase(sendCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendCode.fulfilled, (state) => {
        state.loading = false;
        state.authStep = "verify-code";
      })
      .addCase(sendCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify Code
    builder
      .addCase(verifyCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.loading = false;
        const { patient } = action.payload;
        state.user = patient;
        state.isAuthenticated = true;
        state.authStep = "complete";

        // Persist to localStorage
        localStorage.setItem("intelipadel_user", JSON.stringify(patient));
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        const { data } = action.payload;
        state.user = data;

        // Update localStorage
        localStorage.setItem("intelipadel_user", JSON.stringify(data));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, resetAuthFlow, setTempClubId, selectClub, clearError } =
  authSlice.actions;
export default authSlice.reducer;

export type { ClubOption };
