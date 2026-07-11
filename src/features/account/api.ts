/**
 * Why this file exists:
 * Exposes reusable, typed API functions for the Account / Customer feature.
 * Connects the account UI layer with the Shopify GraphQL layer.
 * Belongs to the feature/account layer.
 */

import { shopifyFetch } from '@/lib/shopify/graphql';
import { customerLoginMutation, customerRegisterMutation } from '@/graphql/mutations/customer';

// Note: In a real Next.js App Router setup, these might be called from Server Actions 
// and the token would be set in a secure HttpOnly cookie.

export async function customerLogin(email: string, password: string): Promise<{ accessToken: string; expiresAt: string } | null> {
  const res = await shopifyFetch<{ 
    customerAccessTokenCreate: { 
      customerAccessToken: { accessToken: string; expiresAt: string } | null;
      customerUserErrors: { field: string[]; message: string; code: string }[];
    } 
  }>({
    query: customerLoginMutation,
    variables: { input: { email, password } },
  });

  const errors = res.body.customerAccessTokenCreate.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return res.body.customerAccessTokenCreate.customerAccessToken;
}

export async function customerRegister(firstName: string, lastName: string, email: string, password: string): Promise<string | null> {
  const res = await shopifyFetch<{ 
    customerCreate: { 
      customer: { id: string } | null;
      customerUserErrors: { field: string[]; message: string; code: string }[];
    } 
  }>({
    query: customerRegisterMutation,
    variables: { input: { firstName, lastName, email, password } },
  });

  const errors = res.body.customerCreate.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return res.body.customerCreate.customer?.id || null;
}

export async function customerProfile(_accessToken: string) {
  // To be implemented when customer queries are required (Milestone 9)
  // Currently the API requires a getCustomer query.
  throw new Error("customerProfile not fully implemented yet.");
}
