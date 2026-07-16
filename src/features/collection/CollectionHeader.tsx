"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface CollectionHeaderProps {
  title: string;
  description?: string;
}

export function CollectionHeader({ title, description }: CollectionHeaderProps) {
  return (
    <div className="pt-16 px-3 md:px-5 max-w-7xl mx-auto mb-3">
      <div className="pb-3 border-b border-gray-100">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/collections" className="hover:text-gray-600 transition-colors">Collections</Link>
          {title && title !== "Our Collections" && (
            <>
              <span aria-hidden="true">/</span>
              <span className="text-gray-700 font-medium">{title}</span>
            </>
          )}
        </nav>

        {/* Title row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-baseline justify-between gap-4"
        >
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 capitalize">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-400 hidden md:block max-w-md text-right truncate">
              {description}
            </p>
          )}
        </motion.div>

      </div>
    </div>
  );
}
