import { configureStore } from "@reduxjs/toolkit";
import bookingsReducer from "./slices/bookingsSlice";
import clubsReducer from "./slices/clubsSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    bookings: bookingsReducer,
    clubs: clubsReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
