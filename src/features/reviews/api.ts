export interface JudgemeReview {
  id: number;
  title: string | null;
  body: string | null;
  rating: number;
  reviewerName: string | null;
  verifiedBuyer: boolean;
  createdAt: string;
  images: string[];
}

export interface JudgemeReviewsData {
  averageRating: number | null;
  reviewCount: number;
  ratingDistribution: Record<number, number>;
  reviews: JudgemeReview[];
}

const VERIFIED_STATUSES = [
  "confirmed-buyer",
  "buyer",
  "verified-purchase",
  "semi-verified-purchase",
  "admin"
];

/**
 * Resolves a Shopify product ID or handle to the Judge.me internal product ID.
 */
export async function getJudgemeProductId(
  externalId: string | number,
  handle: string
): Promise<number | null> {
  const token = process.env.JUDGEME_PRIVATE_API_TOKEN;
  const shopDomain = process.env.JUDGEME_SHOP_DOMAIN;

  if (!token || !shopDomain) {
    console.error("Judge.me credentials are not configured in environment variables.");
    return null;
  }

  // Extract numeric ID from gid://shopify/Product/12345
  const cleanId = String(externalId).replace("gid://shopify/Product/", "");

  try {
    const url = `https://judge.me/api/v1/products/-1?api_token=${token}&shop_domain=${shopDomain}&external_id=${cleanId}`;
    const res = await fetch(url);
    
    if (res.ok) {
      const data = await res.json();
      if (data.product?.id) {
        return data.product.id;
      }
    }

    // Fallback lookup using handle
    const fallbackUrl = `https://judge.me/api/v1/products/-1?api_token=${token}&shop_domain=${shopDomain}&handle=${encodeURIComponent(handle)}`;
    const fallbackRes = await fetch(fallbackUrl);
    
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      return data.product?.id || null;
    }
  } catch (err) {
    console.error("Error looking up Judge.me product ID:", err);
  }

  return null;
}

/**
 * Fetches real reviews for a product from the Judge.me REST API.
 * Aggregates reviews to compute average rating and star distributions.
 */
export async function getProductReviews(
  externalId: string | number,
  handle: string
): Promise<JudgemeReviewsData> {
  const defaultData: JudgemeReviewsData = {
    averageRating: null,
    reviewCount: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    reviews: []
  };

  const token = process.env.JUDGEME_PRIVATE_API_TOKEN;
  const shopDomain = process.env.JUDGEME_SHOP_DOMAIN;

  if (!token || !shopDomain) {
    return defaultData;
  }

  const judgemeProductId = await getJudgemeProductId(externalId, handle);
  if (!judgemeProductId) {
    return defaultData;
  }

  try {
    const url = `https://judge.me/api/v1/reviews?api_token=${token}&shop_domain=${shopDomain}&product_id=${judgemeProductId}&per_page=100`;
    const res = await fetch(url, { cache: "no-store" });
    
    if (!res.ok) {
      return defaultData;
    }

    const data = await res.json();
    const rawReviews = data.reviews || [];

    if (rawReviews.length === 0) {
      return defaultData;
    }

    let totalRating = 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    const parsedReviews: JudgemeReview[] = rawReviews.map((rev: any) => {
      const rating = Math.max(1, Math.min(5, rev.rating || 5));
      totalRating += rating;
      distribution[rating as keyof typeof distribution] = (distribution[rating as keyof typeof distribution] || 0) + 1;

      // Determine verification status
      const isVerified = 
        rev.verified === true || 
        (typeof rev.verified === "string" && VERIFIED_STATUSES.includes(rev.verified.toLowerCase()));

      // Extract image URLs if they exist
      const images: string[] = [];
      if (Array.isArray(rev.pictures)) {
        rev.pictures.forEach((pic: any) => {
          if (pic.urls?.compact) images.push(pic.urls.compact);
          else if (pic.urls?.small) images.push(pic.urls.small);
          else if (pic.urls?.huge) images.push(pic.urls.huge);
        });
      }

      return {
        id: rev.id,
        title: rev.title || null,
        body: rev.body || null,
        rating,
        reviewerName: rev.reviewer?.name || null,
        verifiedBuyer: isVerified,
        createdAt: rev.created_at || new Date().toISOString(),
        images
      };
    });

    const reviewCount = parsedReviews.length;
    const averageRating = parseFloat((totalRating / reviewCount).toFixed(1));

    return {
      averageRating,
      reviewCount,
      ratingDistribution: distribution,
      reviews: parsedReviews
    };
  } catch (err) {
    console.error("Error fetching Judge.me reviews:", err);
    return defaultData;
  }
}
