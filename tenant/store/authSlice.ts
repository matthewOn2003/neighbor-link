import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./authApi";

const initialState = {
  user: null as any,
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
