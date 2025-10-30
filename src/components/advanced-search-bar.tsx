"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestSelector } from "@/components/guest-selector";
import { LocationSelector } from "@/components/location-selector";
import { DateRangePicker } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";

interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface AdvancedSearchBarProps {
  onSearch?: (params: {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: GuestCounts;
  }) => void;
  className?: string;
}

export function AdvancedSearchBar({ onSearch, className = "" }: AdvancedSearchBarProps) {
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState<GuestCounts>({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSearch = () => {
    if (onSearch) {
      const checkIn = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : "";
      const checkOut = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : "";
      onSearch({ location, checkIn, checkOut, guests });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`bg-white rounded-full shadow-lg border border-gray-200 ${className}`}>
      <div className="flex items-center">
        {/* Location */}
        <div
          className={`flex-1 px-6 py-3 rounded-l-full transition-colors ${
            focusedField === "location" ? "bg-gray-50" : "hover:bg-gray-50"
          }`}
        >
          <LocationSelector
            value={location}
            onChange={setLocation}
            onFocus={() => setFocusedField("location")}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-300" />

        {/* Date Range */}
        <div
          className={`flex-1 px-6 py-3 transition-colors ${
            focusedField === "dates" ? "bg-gray-50" : "hover:bg-gray-50"
          }`}
        >
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            onFocus={() => setFocusedField("dates")}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-300" />

        {/* Guests */}
        <div
          className={`flex-1 px-6 py-3 transition-colors ${
            focusedField === "guests" ? "bg-gray-50" : "hover:bg-gray-50"
          }`}
          onFocus={() => setFocusedField("guests")}
          onBlur={() => setFocusedField(null)}
        >
          <GuestSelector value={guests} onChange={setGuests} />
        </div>

        {/* Search Button */}
        <div className="pr-2 pl-4">
          <Button
            onClick={handleSearch}
            size="icon"
            className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">검색</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
