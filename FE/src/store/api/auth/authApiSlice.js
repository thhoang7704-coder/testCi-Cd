import { apiSlice } from "../apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (user) => ({
        // Avoid trailing slash: some Spring Security configs permit `/api/v1/users` but not `/api/v1/users/`.
        url: "/users/",
        method: "POST",
        body: user,
      }),
    }),
    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),
  }),
});
export const { useRegisterUserMutation, useLoginMutation } = authApi;
