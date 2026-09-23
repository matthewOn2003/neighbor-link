import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { authApi } from "./authApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware),
});

// 给 useSelector / useDispatch 用的类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;