"use client";

import { motion } from "framer-motion";

interface CollectionHeaderProps {
  title: string;
  description: string;
}

export function CollectionHeader({ title, description }: CollectionHeaderProps) {
  return (
    <section className="pt-24 pb-16 px-6 max-w-4xl mx-auto text-center">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
      >
        {title}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-gray-500 text-lg md:text-xl font-light"
      >
        {description}
      </motion.p>
    </section>
  );
}
