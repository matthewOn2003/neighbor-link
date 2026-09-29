import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
  endpoints: (builder) => ({
    login: builder.mutation<any, any>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    getSession: builder.query<any, void>({
      query: () => "/auth/session",
    }),
    logout: builder.mutation<any, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
});

export const { useLoginMutation, useGetSessionQuery, useLogoutMutation } = authApi;
