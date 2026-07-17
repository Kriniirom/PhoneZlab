/**
 * Update customer phone number via Shopify Customer Account API.
 * Uses the same OAuth token and API endpoint as fetchCustomerProfile.
 */

const API_VERSION = '2024-04';

export interface UpdatePhoneResult {
  success: boolean;
  phone?: string;
  error?: string;
}

/**
 * Updates the customer's phone number via the Customer Account API.
 * @param token - The raw customer access token (from OAuth login)
 * @param phone - Phone number in E.164 format, e.g. "+919876543210"
 */
export async function updateCustomerPhone(
  token: string,
  phone: string
): Promise<UpdatePhoneResult> {
  // Mock mode support
  if (token === "mock_customer_token" || token.startsWith("mock")) {
    return { success: true, phone };
  }

  const shopId = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID;
  if (!shopId) {
    return { success: false, error: "Missing Shop ID configuration." };
  }

  // Validate E.164 format
  if (!/^\+\d{10,15}$/.test(phone)) {
    return { success: false, error: "Phone number must be in E.164 format (e.g. +919876543210)." };
  }

  const query = `
    mutation customerUpdate($input: CustomerUpdateInput!) {
      customerUpdate(input: $input) {
        customer {
          phoneNumber {
            phoneNumber
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://shopify.com/${shopId}/account/customer/api/${API_VERSION}/graphql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token, // RAW token, no "Bearer " prefix
        },
        body: JSON.stringify({
          query,
          variables: {
            input: {
              phoneNumber: phone,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Phone update failed:", errorText);
      return { success: false, error: `Update failed: ${response.statusText || errorText}` };
    }

    const result = await response.json();

    // Handle GraphQL-level errors
    if (result.errors && result.errors.length > 0) {
      console.error("GraphQL errors updating phone:", result.errors);
      return { success: false, error: result.errors[0].message };
    }

    // Handle user errors from the mutation
    const userErrors = result.data?.customerUpdate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error("Customer update user errors:", userErrors);
      return { success: false, error: userErrors[0].message };
    }

    const updatedPhone = result.data?.customerUpdate?.customer?.phoneNumber?.phoneNumber;
    return { success: true, phone: updatedPhone || phone };
  } catch (err: any) {
    console.error("Phone update error:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}
