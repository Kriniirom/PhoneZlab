/**
 * Why this file exists:
 * Defines GraphQL mutations for Customer Auth operations.
 * Belongs to the GraphQL infrastructure layer.
 */

// GraphQL mutation to exchange customer credentials (email/password) for an authenticated Storefront access token.
// Allows persistent customer sessions in the checkout environment.
export const customerLoginMutation = /* GraphQL */ `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// GraphQL mutation to register a new user account profile in Shopify.
// Yields the generated customer record ID on successful creation.
export const customerRegisterMutation = /* GraphQL */ `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
