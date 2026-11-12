import { baseApi } from "./baseApi";
import {
  IAuthUser,
  ILoginResponse,
  IRegisterSellerResponse,
  ILoginPayload,
  IRegisterCustomerPayload,
  IRegisterSellerPayload,
  IApiResponse,
} from "@/types";

export const authApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ILoginResponse, ILoginPayload>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<ILoginResponse>) => res.data,
      invalidatesTags: ["Auth"],
    }),

    registerCustomer: builder.mutation<ILoginResponse, IRegisterCustomerPayload>({
      query: (body) => ({
        url: "/auth/register/customer",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<ILoginResponse>) => res.data,
      invalidatesTags: ["Auth"],
    }),

    registerSeller: builder.mutation<IRegisterSellerResponse, IRegisterSellerPayload>({
      query: (body) => ({
        url: "/auth/register/seller",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<IRegisterSellerResponse>) => res.data,
      invalidatesTags: ["Auth"],
    }),

    getMe: builder.query<IAuthUser, void>({
      query: () => "/auth/me",
      transformResponse: (res: IApiResponse<IAuthUser>) => res.data,
      providesTags: ["Auth"],
    }),

    changePassword: builder.mutation<
      { message: string },
      { oldPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<{ message: string }>) => res.data,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterCustomerMutation,
  useRegisterSellerMutation,
  useGetMeQuery,
  useChangePasswordMutation,
} = authApiSlice;
