"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  className = "",
  placeholder = "어떤 쉼을 찾고 있나요?",
  onSearch
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div
        className={`
          relative flex items-center w-full max-w-[500px] mx-auto
          rounded-[50px] overflow-hidden
          transition-all duration-300
          ${isFocused
            ? 'bg-white shadow-[rgba(0,0,0,0.1)_0_8px_24px_0,rgba(0,0,0,0.02)_0_0_0_1px]'
            : 'bg-gradient-to-b from-white via-[#ffffff] to-[#f8f8f8] shadow-sm'
          }
        `}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full bg-transparent outline-none
            text-gray-900 placeholder:text-[#6A6A6A]
            transition-all duration-300
            ${isFocused ? 'py-[15px] px-8 pr-12' : 'py-[15px] px-6 pr-12'}
            text-base
            [-webkit-search-cancel-button]:hidden
            [-webkit-search-decoration]:hidden
          `}
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="검색"
        >
          <Search className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </form>
  );
}
