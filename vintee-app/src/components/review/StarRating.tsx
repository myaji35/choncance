"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: 16, md: 24, lg: 32 };

export default function StarRating({
  value,
  onChange,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const isInteractive = !!onChange;
  const px = sizeMap[size];

  return (
    <div className="inline-flex gap-0.5" role="radiogroup" aria-label="별점">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = isInteractive
          ? star <= (hovered || value)
          : star <= Math.round(value);

        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            className={`transition-colors ${isInteractive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => isInteractive && setHovered(star)}
            onMouseLeave={() => isInteractive && setHovered(0)}
            aria-label={`${star}점`}
          >
            <svg
              width={px}
              height={px}
              viewBox="0 0 24 24"
              fill={filled ? "#F59E0B" : "none"}
              stroke={filled ? "#F59E0B" : "#D1D5DB"}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
      {!isInteractive && value > 0 && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
