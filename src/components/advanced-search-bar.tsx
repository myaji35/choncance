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
    <div className={`bg-white rounded-2xl md:rounded-full shadow-lg border border-gray-200 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0 p-2 md:p-0">
        {/* Location */}
        <div
          className={`flex-1 px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-l-full transition-colors ${
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

        {/* Divider - hidden on mobile */}
        <div className="hidden md:block w-px h-8 bg-gray-300" />

        {/* Date Range */}
        <div
          className={`flex-1 px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-none transition-colors ${
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

        {/* Divider - hidden on mobile */}
        <div className="hidden md:block w-px h-8 bg-gray-300" />

        {/* Guests */}
        <div
          className={`flex-1 px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-none transition-colors ${
            focusedField === "guests" ? "bg-gray-50" : "hover:bg-gray-50"
          }`}
          onFocus={() => setFocusedField("guests")}
          onBlur={() => setFocusedField(null)}
        >
          <GuestSelector value={guests} onChange={setGuests} />
        </div>

        {/* Search Button */}
        <div className="w-full md:w-auto md:pr-2 md:pl-4">
          <Button
            onClick={handleSearch}
            size="default"
            className="w-full md:w-auto md:rounded-full md:h-12 md:w-12 bg-primary hover:bg-primary/90"
          >
            <Search className="h-5 w-5 md:mr-0 mr-2" />
            <span className="md:sr-only">검색</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
