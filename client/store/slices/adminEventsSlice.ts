import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { Event, CreateEventData, UpdateEventData } from "@shared/types";

interface AdminEventsState {
  events: Event[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: AdminEventsState = {
  events: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const getAdminEvents = createAsyncThunk(
  "adminEvents/getEvents",
  async (_, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.get("/api/admin/events", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Error al cargar los eventos",
      );
    }
  },
);

export const createAdminEvent = createAsyncThunk(
  "adminEvents/createEvent",
  async (data: CreateEventData, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.post("/api/admin/events", data, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Error al crear el evento",
      );
    }
  },
);

export const updateAdminEvent = createAsyncThunk(
  "adminEvents/updateEvent",
  async (data: UpdateEventData, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await axios.put(`/api/admin/events/${data.id}`, data, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Error al actualizar el evento",
      );
    }
  },
);

export const deleteAdminEvent = createAsyncThunk(
  "adminEvents/deleteEvent",
  async (id: number, { rejectWithValue }) => {
    try {
      const sessionToken = localStorage.getItem("adminSessionToken");
      await axios.delete(`/api/admin/events/${id}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Error al eliminar el evento",
      );
    }
  },
);

const adminEventsSlice = createSlice({
  name: "adminEvents",
  initialState,
  reducers: {
    clearEventsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Events
      .addCase(getAdminEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(getAdminEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Event
      .addCase(createAdminEvent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createAdminEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.events.push(action.payload);
      })
      .addCase(createAdminEvent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Update Event
      .addCase(updateAdminEvent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateAdminEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.events.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateAdminEvent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Delete Event
      .addCase(deleteAdminEvent.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteAdminEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.events = state.events.filter((e) => e.id !== action.payload);
      })
      .addCase(deleteAdminEvent.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEventsError } = adminEventsSlice.actions;
export default adminEventsSlice.reducer;
