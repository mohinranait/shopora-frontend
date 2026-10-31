import { baseApi } from "./baseApi";
import type { IApiResponse } from "@/types/common.type";
import type { IProductQuestion, ICreateQuestionPayload, IAnswerQuestionPayload } from "@/types/question.type";

export const questionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductQuestions: builder.query<IApiResponse<IProductQuestion[]>, string>({
      query: (productId) => `/questions/product/${productId}`,
      providesTags: (_result, _error, productId) => [
        { type: "Questions", id: productId },
        { type: "Questions", id: "LIST" },
      ],
    }),

    askQuestion: builder.mutation<IApiResponse<IProductQuestion>, ICreateQuestionPayload>({
      query: (body) => ({
        url: "/questions",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Questions", id: arg.productId },
        { type: "Questions", id: "LIST" },
      ],
    }),

    answerQuestion: builder.mutation<
      IApiResponse<IProductQuestion>,
      { id: string; body: IAnswerQuestionPayload; productId?: string }
    >({
      query: ({ id, body }) => ({
        url: `/questions/${id}/answer`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Question", id: arg.id },
        { type: "Questions", id: "LIST" },
        ...(arg.productId ? [{ type: "Questions" as const, id: arg.productId }] : []),
      ],
    }),

    deleteQuestion: builder.mutation<IApiResponse<{ id: string }>, { id: string; productId?: string }>({
      query: ({ id }) => ({
        url: `/questions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Question", id: arg.id },
        { type: "Questions", id: "LIST" },
        ...(arg.productId ? [{ type: "Questions" as const, id: arg.productId }] : []),
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductQuestionsQuery,
  useAskQuestionMutation,
  useAnswerQuestionMutation,
  useDeleteQuestionMutation,
} = questionApi;
