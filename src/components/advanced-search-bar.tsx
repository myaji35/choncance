"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdvancedSearchBarProps {
  onSearch?: (params: {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => void;
  className?: string;
}

export function AdvancedSearchBar({ onSearch, className = "" }: AdvancedSearchBarProps) {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSearch = () => {
    if (onSearch) {
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
          <label htmlFor="location" className="block text-xs font-semibold text-gray-900 mb-1">
            여행지
          </label>
          <input
            id="location"
            type="text"
            placeholder="어디로 떠나시나요?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => setFocusedField("location")}
            onBlur={() => setFocusedField(null)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm bg-transparent border-none outline-none placeholder:text-gray-500"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-300" />

        {/* Check-in Date */}
        <div
          className={`flex-1 px-6 py-3 transition-colors ${
            focusedField === "checkIn" ? "bg-gray-50" : "hover:bg-gray-50"
          }`}
        >
          <label htmlFor="checkIn" className="block text-xs font-semibold text-gray-900 mb-1">
            체크인
          </label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            onFocus={() => setFocusedField("checkIn")}
            onBlur={() => setFocusedField(null)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm bg-transparent border-none outline-none text-gray-500"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-300" />

        {/* Check-out Date */}
        <div
          className={`flex-1 px-6 py-3 transition-colors ${
            focusedField === "checkOut" ? "bg-gray-50" : "hover:bg-gray-50"
          }`}
        >
          <label htmlFor="checkOut" className="block text-xs font-semibold text-gray-900 mb-1">
            체크아웃
          </label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            onFocus={() => setFocusedField("checkOut")}
            onBlur={() => setFocusedField(null)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm bg-transparent border-none outline-none text-gray-500"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-300" />

        {/* Guests */}
        <div
          className={`flex-1 px-6 py-3 transition-colors ${
            focusedField === "guests" ? "bg-gray-50" : "hover:bg-gray-50"
          }`}
        >
          <label htmlFor="guests" className="block text-xs font-semibold text-gray-900 mb-1">
            인원
          </label>
          <input
            id="guests"
            type="number"
            min="1"
            max="20"
            placeholder="게스트 추가"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            onFocus={() => setFocusedField("guests")}
            onBlur={() => setFocusedField(null)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm bg-transparent border-none outline-none placeholder:text-gray-500"
          />
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
