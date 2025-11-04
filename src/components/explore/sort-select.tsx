"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption =  | "popular"
  | "rating"
  | "price_low"
  | "price_high"
  | "latest";

interface SortSelectProps {
  defaultValue?: SortOption;
  className?: string;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "인기순" },
  { value: "rating", label: "평점 높은 순" },
  { value: "price_low", label: "가격 낮은 순" },
  { value: "price_high", label: "가격 높은 순" },
  { value: "latest", label: "최신순" },
];

export function SortSelect({ defaultValue = "popular", className }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as SortOption) || defaultValue;

  const handleSortChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className={`w-[160px] sm:w-[180px] ${className}`}>
        <SelectValue placeholder="정렬 기준" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
