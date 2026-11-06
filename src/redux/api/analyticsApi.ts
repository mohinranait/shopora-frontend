import { baseApi } from "./baseApi";
import type { IApiResponse } from "@/types";

export interface IAdminAnalyticsData {
  revenue: {
    grossSales: number;
    platformCommission: number;
    directSalesProfit: number;
    directSalesRevenue: number;
    directSalesCost: number;
    netPlatformProfit: number;
    profitMarginPercent: number;
    activeStockInvestment: number;
    totalCatalogInvestment: number;
  };
  orders: {
    total: number;
    delivered: number;
    pending: number;
  };
  users: {
    totalUsers: number;
    activeSellers: number;
    pendingSellers: number;
  };
  products: {
    total: number;
    published: number;
  };
  topSellingProducts: Array<{
    id: string;
    name: string;
    slug: string;
    mainImage: string;
    basePrice: number;
    totalSold: number;
    stock: number;
    isPlatformOwned: boolean;
  }>;
  recentOrders: any[];
}

export const analyticsApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAnalytics: builder.query<IAdminAnalyticsData, void>({
      query: () => "/analytics/admin",
      transformResponse: (res: IApiResponse<IAdminAnalyticsData>) => res.data,
      providesTags: ["Orders", "Product", "Seller"],
    }),
  }),
});

export const { useGetAdminAnalyticsQuery } = analyticsApiSlice;
