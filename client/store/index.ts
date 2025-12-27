import { configureStore } from "@reduxjs/toolkit";
import bookingsReducer from "./slices/bookingsSlice";
import clubsReducer from "./slices/clubsSlice";
import authReducer from "./slices/authSlice";
import availabilityReducer from "./slices/availabilitySlice";
import paymentReducer from "./slices/paymentSlice";
import clubPoliciesReducer from "./slices/clubPoliciesSlice";
import adminAuthReducer from "./slices/adminAuthSlice";
import adminDashboardReducer from "./slices/adminDashboardSlice";
import adminBookingsReducer from "./slices/adminBookingsSlice";
import adminPlayersReducer from "./slices/adminPlayersSlice";
import adminCourtsReducer from "./slices/adminCourtsSlice";
import adminBlockedDatesReducer from "./slices/adminBlockedDatesSlice";
import adminUsersReducer from "./slices/adminUsersSlice";
import adminPoliciesReducer from "./slices/adminPoliciesSlice";

export const store = configureStore({
  reducer: {
    bookings: bookingsReducer,
    clubs: clubsReducer,
    auth: authReducer,
    availability: availabilityReducer,
    payment: paymentReducer,
    clubPolicies: clubPoliciesReducer,
    adminAuth: adminAuthReducer,
    adminDashboard: adminDashboardReducer,
    adminBookings: adminBookingsReducer,
    adminPlayers: adminPlayersReducer,
    adminCourts: adminCourtsReducer,
    adminBlockedDates: adminBlockedDatesReducer,
    adminUsers: adminUsersReducer,
    adminPolicies: adminPoliciesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
