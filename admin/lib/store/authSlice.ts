import { createSlice } from "@reduxjs/toolkit";
import type { User } from "@/lib/types/user";
import { authApi } from "./authApi";

type AuthState = {
  user: User | null;
  isLoggedIn: boolean;
};

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isLoggedIn = true;
      })
      .addMatcher(authApi.endpoints.getSession.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isLoggedIn = true;
      })
      .addMatcher(authApi.endpoints.getSession.matchRejected, (state) => {
        state.user = null;
        state.isLoggedIn = false;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
      });
  },
});

export default authSlice.reducer;