import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { User } from "@/lib/types/user";

type LoginRequest = {
  username: string;
  password: string;
  role: string;
};

type SessionResponse = {
  user: User;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
  endpoints: (builder) => ({
    login: builder.mutation<SessionResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    getSession: builder.query<SessionResponse, void>({
      query: () => "/auth/session",
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
});

export const { useLoginMutation, useGetSessionQuery, useLogoutMutation } = authApi;
