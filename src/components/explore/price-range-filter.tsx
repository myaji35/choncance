"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  value,
  onChange,
}: PriceRangeFilterProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    const priceRange: [number, number] = [newValue[0], newValue[1]];
    setLocalValue(priceRange);
  };

  const handleValueCommit = (newValue: number[]) => {
    const priceRange: [number, number] = [newValue[0], newValue[1]];
    onChange(priceRange);
  };

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold">가격 범위 (1박)</Label>

      <div className="px-2">
        <Slider
          min={minPrice}
          max={maxPrice}
          step={10000}
          value={localValue}
          onValueChange={handleValueChange}
          onValueCommit={handleValueCommit}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{formatPrice(localValue[0])}</span>
        <span>~</span>
        <span>{formatPrice(localValue[1])}</span>
      </div>

      <div className="text-xs text-gray-500 text-center">
        평균 가격: ₩{Math.round((minPrice + maxPrice) / 2).toLocaleString()}
      </div>
    </div>
  );
}
