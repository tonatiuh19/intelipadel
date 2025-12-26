import { configureStore } from "@reduxjs/toolkit";
import bookingsReducer from "./slices/bookingsSlice";
import clubsReducer from "./slices/clubsSlice";
import authReducer from "./slices/authSlice";
import availabilityReducer from "./slices/availabilitySlice";
import paymentReducer from "./slices/paymentSlice";
import clubPoliciesReducer from "./slices/clubPoliciesSlice";

export const store = configureStore({
  reducer: {
    bookings: bookingsReducer,
    clubs: clubsReducer,
    auth: authReducer,
    availability: availabilityReducer,
    payment: paymentReducer,
    clubPolicies: clubPoliciesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
