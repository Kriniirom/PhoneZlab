/**
 * Shopify Customer Account API OAuth 2.0 with PKCE Utilities
 * Handles PKCE generation, authentication redirect, token exchange, session cookie management,
 * customer profile querying, and sign out.
 */

const COOKIE_NAME = 'shopify_customer_token';
const API_VERSION = '2024-04';

// Helper to generate a high-entropy random string for PKCE code verifier
export function generateCodeVerifier(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  const values = new Uint8Array(128);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(values);
    for (let i = 0; i < values.length; i++) {
      verifier += charset[values[i] % charset.length];
    }
  }
  return verifier;
}

// Helper to generate SHA-256 hash of verifier and base64url encode it
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Redirects client browser to Shopify Customer Account Auth URL
export async function redirectToShopifyLogin() {
  const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  const shopId = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID;

  if (!clientId || !shopId) {
    console.error("Missing Customer Account API environment variables");
    alert("Authentication configuration is missing. Please check your environment variables.");
    return;
  }

  const redirectUri = `${window.location.origin}/auth/callback`;
  const state = Math.random().toString(36).substring(2, 15);
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  sessionStorage.setItem('shopify_auth_state', state);
  sessionStorage.setItem('shopify_auth_verifier', verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'openid email customer-account-api:full',
    response_type: 'code',
    redirect_uri: redirectUri,
    state: state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `https://shopify.com/authentication/${shopId}/oauth/authorize?${params.toString()}`;
  window.location.href = authUrl;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
}

// Exchange authorization code for customer access token
export async function exchangeCodeForToken(code: string, verifier: string): Promise<TokenResponse> {
  const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  const shopId = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID;

  if (!clientId || !shopId) {
    throw new Error("Missing Customer Account API environment variables");
  }

  const redirectUri = `${window.location.origin}/auth/callback`;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code: code,
    code_verifier: verifier,
  });

  const response = await fetch(`https://shopify.com/authentication/${shopId}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token exchange failed:", errorText);
    throw new Error(`Token exchange failed: ${response.statusText || errorText}`);
  }

  return response.json();
}

// Get customer token from document cookies
export function getCustomerToken(): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${COOKIE_NAME}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Save customer token to cookies
export function setCustomerToken(token: string, expiresIn: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${expiresIn}; SameSite=Lax; Secure`;
}

// Delete customer token cookie
export function deleteCustomerToken() {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
}

// Complete client logout
export function logoutCustomer() {
  deleteCustomerToken();
  sessionStorage.removeItem('shopify_auth_state');
  sessionStorage.removeItem('shopify_auth_verifier');
  window.location.href = '/login';
}

export interface FulfillmentTrackingInfo {
  number?: string;
  url?: string;
  company?: string;
}

export interface FulfillmentNode {
  id: string;
  status: string;
  trackingInfo: FulfillmentTrackingInfo[];
}

export interface FulfillmentConnection {
  edges: {
    node: FulfillmentNode;
  }[];
}

export interface OrderLineItem {
  id: string;
  title: string;
  quantity: number;
  image?: {
    url: string;
    altText: string | null;
  } | null;
  variant?: {
    id: string;
    title: string;
    image?: {
      url: string;
      altText: string | null;
    } | null;
    price: {
      amount: string;
      currencyCode: string;
    };
  } | null;
}

export interface OrderLineItemConnection {
  edges: {
    node: OrderLineItem;
  }[];
}

export interface OrderNode {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  lineItems: OrderLineItemConnection;
  fulfillments: FulfillmentConnection;
}

export interface OrderConnection {
  edges: {
    node: OrderNode;
  }[];
}

export interface CustomerProfileData {
  customer: {
    firstName?: string;
    lastName?: string;
    emailAddress?: {
      emailAddress: string;
    };
    phoneNumber?: {
      phoneNumber: string;
    };
    orders: OrderConnection;
  } | null;
}

// Queries Shopify Customer Account GraphQL API for customer profile data.
// Note: Authorization header must contain the RAW token (no Bearer prefix).
export async function fetchCustomerProfile(token: string): Promise<CustomerProfileData> {
  if (token === "mock_customer_token" || token.startsWith("mock")) {
    return {
      customer: {
        firstName: "Irom",
        lastName: "Krinivash",
        emailAddress: {
          emailAddress: "irom.krinivash@phonezlab.com"
        },
        phoneNumber: {
          phoneNumber: "+91 9876543210"
        },
        orders: {
          edges: [
            {
              node: {
                id: "gid://shopify/Order/mock-order-1",
                name: "#PZ-1089",
                processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                financialStatus: "PAID",
                fulfillmentStatus: "FULFILLED",
                totalPrice: {
                  amount: "1899.00",
                  currencyCode: "INR"
                },
                lineItems: {
                  edges: [
                    {
                      node: {
                        id: "gid://shopify/OrderLineItem/mock-item-1",
                        title: "Luxury Alcantara Case - Midnight Black for iPhone 15 Pro Max",
                        quantity: 1,
                        image: {
                          url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=150&q=80",
                          altText: "Midnight Black Case"
                        },
                        variant: {
                          id: "gid://shopify/ProductVariant/mock-variant-1",
                          title: "iPhone 15 Pro Max / Midnight Black",
                          price: {
                            amount: "1899.00",
                            currencyCode: "INR"
                          }
                        }
                      }
                    }
                  ]
                },
                fulfillments: {
                  edges: [
                    {
                      node: {
                        id: "gid://shopify/Fulfillment/mock-fulfillment-1",
                        status: "SUCCESS",
                        trackingInfo: [
                          {
                            company: "Delhivery",
                            number: "DEL9876543210",
                            url: "https://www.delhivery.com/track/package/DEL9876543210"
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            },
            {
              node: {
                id: "gid://shopify/Order/mock-order-2",
                name: "#PZ-1088",
                processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                financialStatus: "PAID",
                fulfillmentStatus: "PARTIALLY_FULFILLED",
                totalPrice: {
                  amount: "3798.00",
                  currencyCode: "INR"
                },
                lineItems: {
                  edges: [
                    {
                      node: {
                        id: "gid://shopify/OrderLineItem/mock-item-2",
                        title: "Tempered Glass Screen Protector - Ultra Clear",
                        quantity: 2,
                        image: {
                          url: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=150&q=80",
                          altText: "Screen Protector"
                        },
                        variant: {
                          id: "gid://shopify/ProductVariant/mock-variant-2",
                          title: "Default Title",
                          price: {
                            amount: "1899.00",
                            currencyCode: "INR"
                          }
                        }
                      }
                    }
                  ]
                },
                fulfillments: {
                  edges: [
                    {
                      node: {
                        id: "gid://shopify/Fulfillment/mock-fulfillment-2-1",
                        status: "SUCCESS",
                        trackingInfo: [
                          {
                            company: "Blue Dart",
                            number: "BD123456789",
                            url: "https://www.bluedart.com/tracking?awb=BD123456789"
                          }
                        ]
                      }
                    },
                    {
                      node: {
                        id: "gid://shopify/Fulfillment/mock-fulfillment-2-2",
                        status: "PENDING",
                        trackingInfo: []
                      }
                    }
                  ]
                }
              }
            },
            {
              node: {
                id: "gid://shopify/Order/mock-order-3",
                name: "#PZ-1087",
                processedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                financialStatus: "PAID",
                fulfillmentStatus: "UNFULFILLED",
                totalPrice: {
                  amount: "999.00",
                  currencyCode: "INR"
                },
                lineItems: {
                  edges: [
                    {
                      node: {
                        id: "gid://shopify/OrderLineItem/mock-item-3",
                        title: "Silicone Case Overlay - Amber Yellow",
                        quantity: 1,
                        image: null,
                        variant: {
                          id: "gid://shopify/ProductVariant/mock-variant-3",
                          title: "iPhone 15 Pro / Amber Yellow",
                          price: {
                            amount: "999.00",
                            currencyCode: "INR"
                          }
                        }
                      }
                    }
                  ]
                },
                fulfillments: {
                  edges: []
                }
              }
            }
          ]
        }
      }
    };
  }

  const shopId = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID;
  if (!shopId) {
    throw new Error("Missing Shop ID configuration");
  }

  const query = `
    query getCustomerProfile {
      customer {
        firstName
        lastName
        emailAddress {
          emailAddress
        }
        phoneNumber {
          phoneNumber
        }
        orders(first: 20) {
          edges {
            node {
              id
              name
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 20) {
                edges {
                  node {
                    id
                    title
                    quantity
                    image {
                      url
                      altText
                    }
                    variant {
                      id
                      title
                      image {
                        url
                        altText
                      }
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
              fulfillments(first: 10) {
                edges {
                  node {
                    id
                    status
                    trackingInfo {
                      number
                      url
                      company
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`https://shopify.com/${shopId}/account/customer/api/${API_VERSION}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token, // RAW token directly, no "Bearer " prefix
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Profile query failed:", errorText);
    throw new Error(`Profile query failed: ${response.statusText || errorText}`);
  }

  const result = await response.json();
  if (result.errors && result.errors.length > 0) {
    console.error("GraphQL errors fetching profile:", result.errors);
    throw new Error(`GraphQL error: ${result.errors[0].message}`);
  }

  return result.data;
}
