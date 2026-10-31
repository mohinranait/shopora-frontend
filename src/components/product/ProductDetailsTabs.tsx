"use client";

import React, { useState } from "react";
import {
  Star,
  CheckCircle2,
  MessageSquarePlus,
  Send,
  Sparkles,
  Info,
  Video,
  ThumbsUp,
  HelpCircle,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { IProductItem, IReviewItem } from "@/types";
import { useCreateReviewMutation, useGetProductReviewsQuery } from "@/redux/api/reviewApi";
import {
  useGetProductQuestionsQuery,
  useAskQuestionMutation,
  useAnswerQuestionMutation,
} from "@/redux";
import { useAuth } from "@/context/AuthContext";

interface ProductDetailsTabsProps {
  product: IProductItem;
  tabRef?: React.RefObject<HTMLDivElement | null>;
  activeTab: "description" | "specifications" | "reviews" | "qa";
  setActiveTab: (tab: "description" | "specifications" | "reviews" | "qa") => void;
}

export function ProductDetailsTabs({
  product,
  tabRef,
  activeTab,
  setActiveTab,
}: ProductDetailsTabsProps) {
  // Fetch real reviews from RTK Query with fallback to product.reviews
  const { data: fetchedReviews, isLoading: isReviewsLoading } = useGetProductReviewsQuery(
    product.id,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // Fetch real Q&A from RTK Query
  const { data: questionsRes, isLoading: isQuestionsLoading, refetch: refetchQuestions } =
    useGetProductQuestionsQuery(product.id);
  const questions = questionsRes?.data || [];

  const [askQuestion, { isLoading: isAskingQuestion }] = useAskQuestionMutation();
  const [answerQuestion, { isLoading: isAnsweringQuestion }] = useAnswerQuestionMutation();

  const [newQuestionText, setNewQuestionText] = useState("");
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  const { user, isAuthenticated } = useAuth();
  const currentSellerId = user?.sellerProfile?.id || user?.sellerId;

  // Strict Permission Check: Only Admin or the Seller who owns THIS specific product can answer
  const canAnswer = Boolean(
    isAuthenticated &&
      user &&
      (user.role === "ADMIN" ||
        (user.role === "SELLER" &&
          currentSellerId &&
          product.sellerId &&
          currentSellerId === product.sellerId))
  );

  const handleAskQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to ask a question.");
      return;
    }
    if (!newQuestionText.trim()) {
      toast.error("Please enter your question.");
      return;
    }

    try {
      await askQuestion({
        productId: product.id,
        question: newQuestionText.trim(),
      }).unwrap();
      toast.success("Question submitted successfully! Verified merchants will respond shortly.");
      setNewQuestionText("");
      refetchQuestions();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit question. Please login first.");
    }
  };

  const handleAnswerSubmit = async (questionId: string) => {
    if (!answerText.trim()) {
      toast.error("Please enter your response.");
      return;
    }

    try {
      await answerQuestion({
        id: questionId,
        productId: product.id,
        body: { answer: answerText.trim() },
      }).unwrap();
      toast.success("Verified answer published!");
      setAnsweringQuestionId(null);
      setAnswerText("");
      refetchQuestions();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to publish answer.");
    }
  };

  const reviews: IReviewItem[] = fetchedReviews && fetchedReviews.length > 0
    ? fetchedReviews
    : product.reviews || [];

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Please enter your review feedback comment.");
      return;
    }

    try {
      await createReview({
        productId: product.id,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      }).unwrap();

      toast.success("Thank you! Your verified review has been submitted.");
      setTitle("");
      setComment("");
      setRating(5);
      setShowReviewForm(false);
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "data" in err && (err as { data?: { message?: string } }).data?.message
          ? (err as { data: { message: string } }).data.message
          : "Please log in to your account to leave a review.";
      toast.error(errorMsg);
    }
  };

  // Compute rating breakdown percentages
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : star === 5 ? 85 : star === 4 ? 15 : 0;
    return { star, count, percentage };
  });

  return (
    <div ref={tabRef} className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Tabs Header Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("description")}
          className={`flex items-center gap-2 py-4 px-6 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "description"
              ? "border-brand text-brand-deep bg-white shadow-2xs"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <Info className="h-4 w-4" />
          <span>Description & Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("specifications")}
          className={`flex items-center gap-2 py-4 px-6 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "specifications"
              ? "border-brand text-brand-deep bg-white shadow-2xs"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Specifications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 py-4 px-6 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "reviews"
              ? "border-brand text-brand-deep bg-white shadow-2xs"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span>Customer Reviews ({reviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("qa")}
          className={`flex items-center gap-2 py-4 px-6 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === "qa"
              ? "border-brand text-brand-deep bg-white shadow-2xs"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <HelpCircle className="h-4 w-4 text-brand" />
          <span>Questions & Answers ({questions.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 sm:p-8">
        {/* 1. Description Tab */}
        {activeTab === "description" && (
          <div className="space-y-6 max-w-4xl">
            {/* Short highlight banner */}
            {product.shortDescription && (
              <div className="rounded-xl bg-sky-50/70 p-4 border border-sky-100 text-slate-700 text-sm leading-relaxed">
                <span className="font-bold text-brand-deep">Key Highlight: </span>
                {product.shortDescription}
              </div>
            )}

            {/* Main Rich Description */}
            <div
              className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Embedded Video Showcase (if present) */}
            {product.videoUrl && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Video className="h-5 w-5 text-rose-600" />
                  <span>Product Video Demo</span>
                </div>
                <div className="relative aspect-video max-w-2xl rounded-2xl overflow-hidden border border-slate-200 bg-slate-950">
                  <iframe
                    src={product.videoUrl.replace("watch?v=", "embed/")}
                    title="Product Video Demo"
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Tags Pills */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Keywords:
                </span>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. Specifications Tab */}
        {activeTab === "specifications" && (
          <div className="max-w-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Technical Specifications</h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-600 w-1/3">Product Name</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{product.name}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-600">Model / SKU</td>
                    <td className="px-4 py-3 text-slate-900 font-mono">{product.sku}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-600">Brand</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {product.brand?.name || "Official Brand"}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-600">Category</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {product.category?.name || "General"}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-600">Warranty Coverage</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {product.warranty || "Standard 7 Days Replacement Warranty"}
                    </td>
                  </tr>
                  {product.weightKg && (
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-600">Weight</td>
                      <td className="px-4 py-3 text-slate-900 font-medium">{product.weightKg} kg</td>
                    </tr>
                  )}
                  {product.dimensions && (
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-600">Dimensions (L × W × H)</td>
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-600">Free Shipping</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {product.isFreeShipping ? "Yes (Available nationwide)" : "Standard Delivery"}
                    </td>
                  </tr>

                  {/* Attributes breakdown */}
                  {product.selectedAttributes?.map((attr, idx) => (
                    <tr key={attr.attributeId} className={idx % 2 === 0 ? "bg-slate-50/50" : ""}>
                      <td className="px-4 py-3 font-semibold text-slate-600">{attr.name}</td>
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        {attr.values.map((v) => v.value).join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Customer Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-8 max-w-4xl">
            {/* Reviews Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-slate-50/80 border border-slate-200">
              {/* Left Score Column */}
              <div className="md:col-span-5 flex flex-col items-center justify-center text-center sm:border-r border-slate-200 sm:pr-6">
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  {product.ratingAverage || 5.0}
                </span>
                <div className="flex items-center gap-1 my-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i <= Math.round(product.ratingAverage || 5.0)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  Based on {reviews.length} authentic customer ratings
                </p>

                <button
                  type="button"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-2.5 text-xs font-bold text-white hover:bg-brand transition shadow-sm cursor-pointer"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  <span>{showReviewForm ? "Close Form" : "Write a Customer Review"}</span>
                </button>
              </div>

              {/* Right Bars Column */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-2">
                {ratingDistribution.map(({ star, percentage }) => (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-semibold text-slate-700 flex items-center gap-1">
                      {star} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-semibold text-slate-500">
                      {percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Review Form */}
            {showReviewForm && (
              <form
                onSubmit={handleSubmitReview}
                className="rounded-2xl border border-brand/30 bg-sky-50/40 p-6 space-y-4 animate-fadeIn"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Write Your Feedback</h4>
                  <span className="text-xs text-slate-500">Verified buyers get a verified checkmark</span>
                </div>

                {/* Star Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-125 transition cursor-pointer"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-700">
                      {rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Review Headline Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Excellent build quality, highly satisfied!"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                  />
                </div>

                {/* Review Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience regarding performance, packaging, delivery, and overall satisfaction..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-deep px-5 py-2 text-xs font-bold text-white hover:bg-brand transition shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmittingReview ? "Submitting..." : "Submit Review"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-bold text-slate-900">
                Customer Feedback & Photos ({reviews.length})
              </h4>

              {isReviewsLoading && (
                <div className="py-8 text-center text-xs text-slate-500">
                  Loading customer reviews...
                </div>
              )}

              {!isReviewsLoading && reviews.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-8 text-center">
                  <p className="text-xs text-slate-500">
                    No customer reviews yet for this product. Be the first to share your thoughts!
                  </p>
                </div>
              )}

              {reviews.map((rev) => {
                const userName = rev.user?.name || "Verified Customer";
                const initials = userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3 shadow-2xs hover:border-slate-300 transition"
                  >
                    {/* Reviewer Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-deep text-white font-black text-xs">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{userName}</span>
                            {rev.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.2 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Title & Content */}
                    {rev.title && (
                      <h5 className="text-xs font-bold text-slate-900">{rev.title}</h5>
                    )}
                    <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                    {/* Review Photos (if any) */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        {rev.images.map((photo, i) => (
                          <div
                            key={i}
                            className="h-16 w-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100"
                          >
                            <img
                              src={photo}
                              alt="Review attachment"
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Helpful footer */}
                    <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => toast.success("Marked as helpful!")}
                        className="inline-flex items-center gap-1 hover:text-slate-700 transition cursor-pointer"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>Helpful</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Q&A Tab */}
        {activeTab === "qa" && (
          <div className="space-y-8 max-w-4xl">
            {/* Ask Question Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-5 w-5 text-brand" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Have a question about this product?
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Ask our verified merchants and support team directly. Answers are published publicly to help fellow shoppers.
              </p>

              <form onSubmit={handleAskQuestionSubmit} className="space-y-3">
                <textarea
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="e.g. Is this genuine Bangladesh warranty covered? Does it include original accessories?"
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAskingQuestion || !newQuestionText.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isAskingQuestion ? "Submitting..." : "Ask Question"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand" />
                Questions ({questions.length})
              </h4>

              {isQuestionsLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading questions...</div>
              ) : questions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  No questions asked yet for this item. Be the first to ask!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 space-y-4">
                  {questions.map((q) => (
                    <div key={q.id} className="pt-4 first:pt-0 space-y-3">
                      {/* Customer Question */}
                      <div className="flex items-start gap-2.5">
                        <span className="h-5 w-5 rounded-md bg-slate-200 text-slate-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          Q
                        </span>
                        <div className="space-y-1 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900">
                            {q.question}
                          </p>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>Asked by {q.asker?.name || "Customer"}</span>
                            <span>•</span>
                            <span>
                              {new Date(q.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Verified Answer (if present) */}
                      {q.answer ? (
                        <div className="ml-7 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                            <span className="h-4 w-4 rounded-full bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center">
                              A
                            </span>
                            <span>{q.answerer?.name || "Verified Store"}</span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-semibold">
                              <ShieldCheck className="h-3 w-3" /> Verified Merchant
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed pl-5">
                            {q.answer}
                          </p>
                          {q.answeredAt && (
                            <div className="text-[10px] text-slate-400 pl-5">
                              Answered on{" "}
                              {new Date(q.answeredAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* If unanswered and user is verified merchant of this product or platform admin, allow answering */
                        canAnswer && (
                          <div className="ml-7 pt-1">
                            {answeringQuestionId === q.id ? (
                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <textarea
                                  rows={2}
                                  value={answerText}
                                  onChange={(e) => setAnswerText(e.target.value)}
                                  placeholder="Write official merchant response..."
                                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-brand"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAnsweringQuestionId(null);
                                      setAnswerText("");
                                    }}
                                    className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAnswerSubmit(q.id)}
                                    disabled={isAnsweringQuestion || !answerText.trim()}
                                    className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-bold hover:bg-brand/90 disabled:opacity-50 shadow-2xs"
                                  >
                                    {isAnsweringQuestion ? "Publishing..." : "Submit Answer"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAnsweringQuestionId(q.id);
                                  setAnswerText("");
                                }}
                                className="text-xs text-brand font-bold hover:underline inline-flex items-center gap-1"
                              >
                                Answer this question
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
