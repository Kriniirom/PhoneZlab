"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ParsedDiscount {
  id: string;
  title?: string;
  description?: string;
  code?: string;
  discountText?: string;
  minimumOrderText?: string;
  isAutomatic?: boolean;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  desktopImage?: string;
  mobileImage?: string;
  badge?: string;
  textColor?: string;
  ctaColor?: string;
}

interface HeroCarouselProps {
  initialDiscounts: ParsedDiscount[];
}

export function HeroCarousel({ initialDiscounts }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const discounts = initialDiscounts || [];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? discounts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === discounts.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (discounts.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isHovered, discounts.length]);

  if (discounts.length === 0) {
    return (
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-white p-8 md:p-12 rounded-xl border border-slate-100 dark:border-slate-800 shadow-md mx-4 mt-6 text-center">
        <h2 className="text-xl font-bold">No Active Offers</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Check back later for exclusive deals!</p>
      </section>
    );
  }

  const activeSlide = discounts[currentIndex];
  const bgImage = activeSlide.desktopImage || activeSlide.mobileImage;
  const hasText = !!(activeSlide.title || activeSlide.description || activeSlide.discountText || activeSlide.code);

  const slideContent = (
    <div className="flex flex-col md:flex-row items-center justify-between px-8 py-6 md:px-16 md:py-8 gap-6 min-h-[220px] md:min-h-[260px] lg:min-h-[300px] transition-all duration-500 ease-in-out">
      {/* Left Content Column */}
      {hasText && (
        <div className={`relative z-10 max-w-2xl flex-1 flex flex-col justify-center ${bgImage ? 'bg-slate-950/60 backdrop-blur-xs p-5 md:p-6 rounded-xl border border-white/10 text-white' : ''}`}>
          <div
            className="inline-block bg-[#ffc200] text-white font-bold text-[10px] md:text-xs uppercase px-3.5 py-1.5 mb-3 rounded-full tracking-wider w-fit shadow-sm transition-colors"
            style={activeSlide.ctaColor ? { backgroundColor: activeSlide.ctaColor } : undefined}
          >
            {activeSlide.badge || "THE BIG TECH CARNIVAL"}
          </div>

          {/* Slide transitions wrapper */}
          <div className="transition-all duration-300 ease-out min-h-[80px] md:min-h-[100px] flex flex-col justify-start">
            {activeSlide.title && (
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tight leading-tight mb-2 uppercase text-white">
                {activeSlide.title}
              </h1>
            )}
            {activeSlide.discountText && (
              <h2
                className="text-xl md:text-2xl font-black italic mb-3 uppercase text-[#ffc200]"
                style={activeSlide.ctaColor ? { color: activeSlide.ctaColor } : undefined}
              >
                {activeSlide.discountText}
              </h2>
            )}
            {activeSlide.description && (
              <p className="text-sm md:text-base font-medium mb-5 leading-relaxed max-w-xl text-white/90">
                {activeSlide.description}
              </p>
            )}
          </div>

          {/* Code Badge & Minimum Purchase */}
          {(activeSlide.code || activeSlide.minimumOrderText || activeSlide.isAutomatic !== undefined) && (
            <div className="flex items-center flex-wrap gap-2.5 mb-5">
              {activeSlide.code ? (
                <div
                  className="border border-dashed border-[#ffc200]/40 bg-white/5 px-3.5 py-1.5 font-mono font-bold text-xs text-[#ffc200] uppercase rounded-md tracking-wide"
                  style={activeSlide.ctaColor ? { borderColor: `${activeSlide.ctaColor}40`, color: activeSlide.ctaColor } : undefined}
                >
                  CODE: {activeSlide.code}
                </div>
              ) : activeSlide.isAutomatic ? (
                <div className="font-bold text-[10px] uppercase px-3 py-1.5 rounded-md tracking-wide bg-white/10 text-white">
                  Automatically Applied
                </div>
              ) : null}
              {activeSlide.minimumOrderText && (
                <span className="text-xs font-medium tracking-wide text-white/70">
                  {activeSlide.minimumOrderText}
                </span>
              )}
            </div>
          )}

          <Link
            href={activeSlide.buttonUrl || "/collections/all"}
            className="inline-flex items-center gap-2 bg-[#ffc200] hover:bg-[#e0b000] text-white font-bold px-8 py-3 rounded-md shadow-md hover:shadow-lg transition-all text-xs tracking-wider uppercase w-fit cursor-pointer"
            style={activeSlide.ctaColor ? { backgroundColor: activeSlide.ctaColor } : undefined}
          >
            <span>{activeSlide.buttonText || "SHOP GREAT OFFERS"}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <section 
      className="bg-[#0b1528] text-white overflow-hidden rounded-xl border border-slate-800 shadow-md mx-4 mt-6 relative group transition-all duration-300 animate-fade-in"
      style={activeSlide.textColor ? { color: activeSlide.textColor } : {}}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {bgImage ? (
        <div className="relative w-full h-auto block overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={bgImage} 
            alt={activeSlide.title || "Promotional Banner"} 
            className="w-full h-auto block"
          />
          {hasText ? (
            <div className="absolute inset-0 flex items-center justify-start z-10">
              {slideContent}
            </div>
          ) : (
            <Link href={activeSlide.buttonUrl || "/collections/all"} className="absolute inset-0 z-10 cursor-pointer" />
          )}
        </div>
      ) : (
        slideContent
      )}

      {/* Carousel navigation arrows */}
      {discounts.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/10 hover:bg-slate-900/20 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 shadow-xs"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/10 hover:bg-slate-900/20 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 shadow-xs"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide indicators (dots) */}
      {discounts.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 flex gap-2 z-20">
          {discounts.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${idx === currentIndex ? "bg-blue-600 dark:bg-blue-500 w-5" : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                }`}
              style={idx === currentIndex && slide.ctaColor ? { backgroundColor: slide.ctaColor } : undefined}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
