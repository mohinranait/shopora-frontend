import { baseApi } from "./baseApi";
import type {
  IApiResponse,
  IAuthUser,
  ICustomerAddress,
} from "@/types";

export interface IWishlistItem {
  id: string | number;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    productType?: string;
    mainImage: string | null;
    basePrice: number;
    comparePrice?: number | null;
    stock: number;
    ratingAverage?: number | null;
    ratingCount?: number | null;
    status?: string;
  } | null;
}

export interface IUpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar?: string;
  avatarId?: string | number | null;
  avatarUseMediaId?: string | number | null;
}

export interface IAddAddressPayload {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
  type?: "SHIPPING" | "BILLING";
}

export const userApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateUserProfile: builder.mutation<IAuthUser, IUpdateProfilePayload>({
      query: (body) => ({
        url: "/users/profile",
        method: "PATCH",
        body,
      }),
      transformResponse: (res: IApiResponse<IAuthUser>) => res.data,
      invalidatesTags: ["Auth"],
    }),

    getUserAddresses: builder.query<ICustomerAddress[], void>({
      query: () => "/users/addresses",
      transformResponse: (res: IApiResponse<ICustomerAddress[]>) => res.data ?? [],
      providesTags: ["UserAddresses"],
    }),

    addUserAddress: builder.mutation<ICustomerAddress, IAddAddressPayload>({
      query: (body) => ({
        url: "/users/addresses",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<ICustomerAddress>) => res.data,
      invalidatesTags: ["UserAddresses"],
    }),

    deleteUserAddress: builder.mutation<{ message: string }, string | number>({
      query: (id) => ({
        url: `/users/addresses/${id}`,
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string }>) => res.data,
      invalidatesTags: ["UserAddresses"],
    }),

    getUserWishlist: builder.query<IWishlistItem[], void>({
      query: () => "/wishlist",
      transformResponse: (res: IApiResponse<IWishlistItem[]>) => res.data ?? [],
      providesTags: ["Wishlist"],
    }),

    toggleWishlistItem: builder.mutation<
      { isWishlisted: boolean; message: string },
      { productId: string | number }
    >({
      query: (body) => ({
        url: "/wishlist/toggle",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<{ isWishlisted: boolean; message: string }>) => res.data,
      invalidatesTags: ["Wishlist"],
    }),

    clearWishlist: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/wishlist/clear",
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string }>) => res.data,
      invalidatesTags: ["Wishlist"],
    }),
    removeWishlistItem: builder.mutation<{ message: string }, string | number>({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string }>) => res.data,
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useUpdateUserProfileMutation,
  useGetUserAddressesQuery,
  useAddUserAddressMutation,
  useDeleteUserAddressMutation,
  useGetUserWishlistQuery,
  useToggleWishlistItemMutation,
  useRemoveWishlistItemMutation,
  useClearWishlistMutation,
} = userApiSlice;
