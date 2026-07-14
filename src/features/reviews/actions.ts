"use server";

import { getProductReviews, JudgemeReviewsData } from "./api";

/**
 * Server action to fetch Judge.me reviews securely from the server side.
 */
export async function getProductReviewsAction(
  externalId: string | number,
  handle: string
): Promise<JudgemeReviewsData> {
  return await getProductReviews(externalId, handle);
}

export interface CreateReviewParams {
  productId: string;
  name: string;
  email: string;
  rating: number;
  title?: string;
  body: string;
  picture_urls?: string[];
}

/**
 * Server action to securely post a review to the Judge.me API.
 */
export async function createProductReviewAction(params: CreateReviewParams) {
  const token = process.env.JUDGEME_PRIVATE_API_TOKEN;
  const shopDomain = process.env.JUDGEME_SHOP_DOMAIN;

  if (!token || !shopDomain) {
    return { success: false, error: "Judge.me credentials are not configured in environment variables." };
  }

  // Clean the Shopify product ID to numeric
  const cleanId = String(params.productId).replace("gid://shopify/Product/", "");

  try {
    const url = "https://judge.me/api/v1/reviews";
    const payload = {
      api_token: token,
      shop_domain: shopDomain,
      platform: "shopify",
      id: cleanId,
      email: params.email,
      name: params.name,
      rating: params.rating,
      title: params.title || "",
      body: params.body,
      ...(params.picture_urls && params.picture_urls.length > 0 ? { picture_urls: params.picture_urls } : {})
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Judge.me review creation failed:", errorText);
      return { success: false, error: `Review submission failed: ${res.statusText}` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    console.error("Error creating Judge.me review:", err);
    return { success: false, error: err.message || "Failed to submit review." };
  }
}

