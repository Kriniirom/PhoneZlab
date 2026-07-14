import React from 'react';

interface StructuredDataProps {
  data: Record<string, any> | Record<string, any>[];
}

/**
 * Renders a safely stringified JSON-LD script for structured data.
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
