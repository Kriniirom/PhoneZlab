"use client";

import React, { useState } from "react";
import { Star, CheckCircle, MessageSquare, X, Plus, AlertCircle } from "lucide-react";
import type { JudgemeReviewsData, JudgemeReview } from "@/features/reviews/api";
import { createProductReviewAction } from "@/features/reviews/actions";

interface ProductReviewsProps {
  data: JudgemeReviewsData;
  productId: string;
  productHandle: string;
}

export function ProductReviews({ data, productId, productHandle }: ProductReviewsProps) {
  const { averageRating, reviewCount, ratingDistribution, reviews } = data;

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalFiles = [...selectedFiles, ...filesArray].slice(0, 5); // Max 5 images
      setSelectedFiles(totalFiles);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary credentials are not configured in your .env file. Please check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary upload error response:", errorText);
      throw new Error(`Cloudinary upload failed for "${file.name}": ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage("Please select a rating of at least 1 star.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Upload images to Cloudinary if selected
      const pictureUrls: string[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            const url = await uploadToCloudinary(file);
            pictureUrls.push(url);
          } catch (uploadErr: any) {
            throw new Error(`Failed to upload images: ${uploadErr.message}`);
          }
        }
      }

      // 2. Submit review to Judge.me
      const result = await createProductReviewAction({
        productId,
        name,
        email,
        rating,
        title,
        body,
        picture_urls: pictureUrls
      });

      if (result.success) {
        setSuccessMessage("Your review has been submitted successfully. It will appear once approved by the store moderator.");
        // Reset form
        setRating(5);
        setName("");
        setEmail("");
        setTitle("");
        setBody("");
        setSelectedFiles([]);
      } else {
        setErrorMessage(result.error || "Failed to submit review. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (reviewerName: string | null) => {
    if (!reviewerName) return "U";
    const parts = reviewerName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const renderStars = (rating: number, sizeClass = "w-4 h-4") => {
    const stars = [];
    const roundedRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${sizeClass} ${
            i <= roundedRating
              ? "text-[#ffc200] fill-[#ffc200]"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const renderReviewForm = () => {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-150">
          <div>
            <h3 className="text-base font-bold text-gray-900">Share Your Experience</h3>
            <p className="text-xs text-gray-500 mt-0.5">Your honest feedback helps others shop better.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setSuccessMessage("");
              setErrorMessage("");
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMessage ? (
          <div className="bg-emerald-50 border border-emerald-150 p-5 rounded-lg flex gap-3 text-emerald-900 text-xs">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex flex-col gap-2">
              <p className="font-bold text-sm text-emerald-950">Review Submitted Successfully!</p>
              <p className="leading-relaxed">{successMessage}</p>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSuccessMessage("");
                }}
                className="mt-1 font-bold text-emerald-700 hover:text-emerald-800 underline text-left cursor-pointer"
              >
                Return to Product
              </button>
            </div>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-150 p-4 rounded-lg flex gap-2.5 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Rating */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">Your Rating *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = hoverRating ? star <= hoverRating : star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform duration-100 active:scale-90 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 transition-all duration-150 ${
                          filled
                            ? "text-[#ffc200] fill-[#ffc200] drop-shadow-[0_1px_2px_rgba(255,194,0,0.2)]"
                            : "text-gray-300 fill-transparent hover:text-[#ffc200]"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs text-gray-500 font-medium ml-2 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {rating === 5 ? "Excellent ⚡" : rating === 4 ? "Very Good 👍" : rating === 3 ? "Good 😊" : rating === 2 ? "Fair 😐" : rating === 1 ? "Poor 😞" : "Select rating"}
                </span>
              </div>
            </div>

            {/* Grid for Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="rev-name" className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">Display Name *</label>
                <input
                  id="rev-name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-gray-250 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2874f0]/15 focus:border-[#2874f0] transition-all placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="rev-email" className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">Email Address *</label>
                <input
                  id="rev-email"
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-gray-255 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2874f0]/15 focus:border-[#2874f0] transition-all placeholder-gray-400"
                />
                <span className="text-[9px] text-gray-400">Used only for verification (never shared publicly).</span>
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rev-title" className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">Review Title (Optional)</label>
              <input
                id="rev-title"
                type="text"
                placeholder="e.g. Best earbuds ever! / Excellent build quality"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-gray-260 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2874f0]/15 focus:border-[#2874f0] transition-all placeholder-gray-400"
              />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rev-body" className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">Review Comments *</label>
              <textarea
                id="rev-body"
                required
                rows={4}
                placeholder="Write your review here. What did you like or dislike about this product?"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-gray-270 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2874f0]/15 focus:border-[#2874f0] transition-all placeholder-gray-400 resize-none"
              />
            </div>

            {/* Attach Photos */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-700 tracking-wide uppercase">Attach Photos (Optional)</label>
              <div className="flex flex-wrap items-center gap-3">
                {selectedFiles.length < 5 && (
                  <label className="w-16 h-16 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors select-none">
                    <Plus className="w-4 h-4 text-gray-400" />
                    <span className="text-[9px] text-gray-400 font-bold mt-1">Add Photo</span>
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                    />
                  </label>
                )}

                {selectedFiles.map((file, idx) => {
                  const previewUrl = URL.createObjectURL(file);
                  return (
                    <div key={idx} className="relative w-16 h-16 rounded-md border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center group shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt={`Selected preview ${idx + 1}`}
                        className="max-w-full max-h-full object-contain"
                      />
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="absolute -top-1 -right-1 p-0.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow transition-transform hover:scale-110 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="text-[9px] text-gray-400">Supported formats: JPG, JPEG, PNG (Max 5 photos)</span>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-150">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setErrorMessage("");
                }}
                className="px-4 py-2 text-xs font-bold text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#2874f0] text-white rounded-md hover:bg-[#2874f0]/95 hover:shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? "Uploading & Posting..." : "Post Review"}
              </button>
            </div>
          </>
        )}
      </form>
    );
  };

  // Zero reviews state
  if (reviewCount === 0 || !averageRating) {
    return (
      <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            Customer Reviews
          </h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-bold bg-[#2874f0] text-white px-4 py-2 rounded-md hover:bg-[#2874f0]/95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Write a Review
            </button>
          )}
        </div>

        <div className="px-6 py-10">
          {showForm ? (
            <div className="max-w-xl mx-auto py-2">
              {renderReviewForm()}
            </div>
          ) : (
            <div className="text-center py-8 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">No reviews yet</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">Have you purchased this product? Be the first to share your thoughts with other customers!</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-xs font-bold border border-gray-300 text-gray-700 px-5 py-2.5 rounded-md hover:bg-gray-50 hover:text-gray-950 transition-colors shadow-sm cursor-pointer"
              >
                Be the first to review
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculate percentages for distribution bars
  const totalDistributionReviews = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          Ratings & Reviews
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-bold bg-[#2874f0] text-white px-4 py-2 rounded-md hover:bg-[#2874f0]/95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Write a Review
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Review Form Area (collapsible) */}
        {showForm && (
          <div className="mb-8 p-6 bg-gray-50/80 border border-gray-100 rounded-lg max-w-2xl mx-auto shadow-inner animate-fadeIn">
            {renderReviewForm()}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:divide-x md:divide-gray-100">
          
          {/* Left Column: Summary & Rating Distribution */}
          <div className="md:col-span-4 flex flex-col gap-6 pr-0 md:pr-6">
            <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="text-center bg-white border border-gray-100 rounded-md py-2.5 px-4 shadow-sm">
                <span className="text-4xl font-extrabold text-gray-900 leading-none tracking-tight">
                  {averageRating}
                </span>
                <span className="text-[10px] text-gray-400 font-bold block mt-1 uppercase">Rating</span>
              </div>
              
              <div className="flex flex-col gap-1">
                {renderStars(averageRating, "w-4.5 h-4.5")}
                <span className="text-xs text-gray-500 font-medium mt-1">
                  Based on {reviewCount} verified {reviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>

            {/* Distribution chart */}
            {totalDistributionReviews > 0 && (
              <div className="flex flex-col gap-2.5 px-1">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rating Breakdown</h4>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star as keyof typeof ratingDistribution] || 0;
                  const percentage = totalDistributionReviews > 0 
                    ? Math.round((count / totalDistributionReviews) * 100) 
                    : 0;

                  return (
                    <div key={star} className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="w-10 font-bold flex items-center gap-0.5 justify-end text-gray-800">
                        {star} <Star className="w-3 h-3 text-[#ffc200] fill-[#ffc200] shrink-0" />
                      </span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#ffc200] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-gray-500 font-bold">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Reviews List */}
          <div className="md:col-span-8 flex flex-col gap-6 pt-6 md:pt-0 pl-0 md:pl-8">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Customer Feedback</h4>
            <div className="flex flex-col gap-6 divide-y divide-gray-100 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              {reviews.map((review: JudgemeReview, idx) => (
                <div key={review.id} className={`${idx > 0 ? "pt-6" : ""} flex gap-4 items-start`}>
                  
                  {/* Left Side: Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200 shrink-0 shadow-sm uppercase select-none">
                    {getInitials(review.reviewerName)}
                  </div>

                  {/* Right Side: Content */}
                  <div className="flex-1 flex flex-col gap-2">
                    
                    {/* Header (Rating Stars & Verified Badge & Metadata) */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-gray-800">
                          {review.reviewerName || "Anonymous"}
                        </span>
                        {review.verifiedBuyer && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                            <CheckCircle className="w-2.5 h-2.5 fill-current text-white text-emerald-600 shrink-0" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {renderStars(review.rating, "w-3.5 h-3.5")}
                        {review.createdAt && (
                          <span className="text-[10px] text-gray-450 font-medium">
                            {formatDate(review.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h5 className="text-xs font-bold text-gray-900 leading-snug">
                        {review.title}
                      </h5>
                    )}

                    {/* Review Body */}
                    {review.body && (
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/30 p-2 rounded border border-gray-100/50">
                        {review.body}
                      </p>
                    )}

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {review.images.map((imgUrl, i) => (
                          <a 
                            key={i} 
                            href={imgUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="relative w-14 h-14 rounded-md border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center cursor-zoom-in hover:shadow hover:opacity-95 transition-all"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={imgUrl} 
                              alt={`Review attachment ${i + 1}`}
                              className="max-w-full max-h-full object-contain"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
