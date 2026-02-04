"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface HeroCarouselProps {
  images: string[];
  interval?: number;
}

export function HeroCarousel({ images, interval = 5000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentIndex
              ? "translate-x-0"
              : index < currentIndex
              ? "-translate-x-full"
              : "translate-x-full"
          }`}
        >
          <Image
            src={image}
            alt={`호스트 이미지 ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />

      {/* Carousel indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`이미지 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}
