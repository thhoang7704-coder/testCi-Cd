import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // Use relative URL so Vite dev proxy forwards /api -> Spring Boot (avoids CORS).
    baseUrl: "/api/v1",
  }),
  endpoints: (builder) => ({}),
});
