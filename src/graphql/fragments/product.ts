/**
 * Why this file exists:
 * Contains reusable GraphQL fragments for Products and Variants.
 * Follows DRY principles for GraphQL queries.
 * Belongs to the GraphQL infrastructure layer.
 */

export const productSnippet = /* GraphQL */ `
  fragment ProductSnippet on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    options {
      id
      name
      values
    }
    featuredImage {
      url
      altText
      width
      height
    }
    seo {
      title
      description
    }
    productType
    vendor
    tags
    offersMetafield: metafield(namespace: "custom", key: "offers") {
      value
    }
    updatedAt
  }
`;

export const variantSnippet = /* GraphQL */ `
  fragment VariantSnippet on ProductVariant {
    id
    title
    availableForSale
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    selectedOptions {
      name
      value
    }
    image {
      url
      altText
      width
      height
    }
    sku
    weight
    weightUnit
  }
`;
