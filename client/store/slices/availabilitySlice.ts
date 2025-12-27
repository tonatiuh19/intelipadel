import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Event, EventCourtSchedule } from "@shared/types";

interface Court {
  id: number;
  club_id: number;
  name: string;
  court_type: string;
  surface_type: string;
  has_lighting: boolean;
  is_active: boolean;
}

interface BlockedSlot {
  id: number;
  club_id: number;
  court_id: number | null;
  block_type: string;
  block_date: string;
  start_time: string | null;
  end_time: string | null;
  is_all_day: boolean;
  reason: string;
}

interface Booking {
  id: number;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface PrivateClass {
  id: number;
  user_id: number;
  instructor_id: number;
  club_id: number;
  court_id: number | null;
  class_type: string;
  class_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
}

export interface AvailabilityData {
  schedules: any[];
  blockedSlots: BlockedSlot[];
  bookings: Booking[];
  courts: Court[];
  events: Event[];
  eventCourtSchedules?: (EventCourtSchedule & { event_date: string })[];
  privateClasses: PrivateClass[];
}

interface AvailabilityState {
  data: AvailabilityData | null;
  loading: boolean;
  error: string | null;
  lastFetchParams: {
    clubId: number | null;
    startDate: string | null;
    endDate: string | null;
  };
}

const initialState: AvailabilityState = {
  data: null,
  loading: false,
  error: null,
  lastFetchParams: {
    clubId: null,
    startDate: null,
    endDate: null,
  },
};

interface FetchAvailabilityParams {
  clubId: number;
  startDate: string;
  endDate: string;
  courtId?: number;
}

// Async thunk for fetching availability
export const fetchAvailability = createAsyncThunk(
  "availability/fetchAvailability",
  async (params: FetchAvailabilityParams) => {
    const { clubId, startDate, endDate, courtId } = params;
    const url = courtId
      ? `/api/availability?clubId=${clubId}&startDate=${startDate}&endDate=${endDate}&courtId=${courtId}`
      : `/api/availability?clubId=${clubId}&startDate=${startDate}&endDate=${endDate}`;

    const response = await axios.get(url);
    return response.data.data;
  },
);

const availabilitySlice = createSlice({
  name: "availability",
  initialState,
  reducers: {
    clearAvailability: (state) => {
      state.data = null;
      state.error = null;
      state.lastFetchParams = {
        clubId: null,
        startDate: null,
        endDate: null,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAvailability.fulfilled,
        (state, action: PayloadAction<AvailabilityData>) => {
          state.loading = false;
          state.data = action.payload;
        },
      )
      .addCase(fetchAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch availability";
      });
  },
});

export const { clearAvailability, clearError } = availabilitySlice.actions;
export default availabilitySlice.reducer;
