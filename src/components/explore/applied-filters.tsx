"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface AppliedFiltersProps {
  filters: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function AppliedFilters({ filters, onRemove, onClearAll }: AppliedFiltersProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">적용된 필터:</span>

      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="pl-3 pr-1 py-1 gap-1 hover:bg-gray-300 transition-colors"
        >
          <span className="text-sm">
            {filter.label}: {filter.value}
          </span>
          <button
            onClick={() => onRemove(filter.key)}
            className="ml-1 p-0.5 rounded-sm hover:bg-gray-400 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 text-xs text-gray-600 hover:text-gray-900"
      >
        전체 초기화
      </Button>
    </div>
  );
}
