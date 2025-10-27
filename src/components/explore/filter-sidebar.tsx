"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TagFilter } from "./tag-filter";
import { PriceRangeFilter } from "./price-range-filter";
import { LocationFilter } from "./location-filter";
import { DateFilter } from "./date-filter";
import { GuestFilter } from "./guest-filter";
import type { Tag, TagCategory } from "@/types";

interface FilterSidebarProps {
  tags: Record<TagCategory, Tag[]>;
  className?: string;
}

export function FilterSidebar({ tags, className = "" }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([50000, 500000]);
  const [province, setProvince] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(2);
  const [pets, setPets] = useState(false);

  const [priceStats, setPriceStats] = useState({ min: 50000, max: 500000 });

  // Fetch price range stats
  useEffect(() => {
    const fetchPriceStats = async () => {
      try {
        const response = await fetch("/api/filters/price-range");
        const data = await response.json();
        setPriceStats({
          min: data.min_price || 50000,
          max: data.max_price || 500000,
        });
        setPriceRange([data.min_price || 50000, data.max_price || 500000]);
      } catch (error) {
        console.error("Failed to fetch price stats:", error);
      }
    };
    fetchPriceStats();
  }, []);

  // Load filters from URL on mount
  useEffect(() => {
    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      setSelectedTags(tagsParam.split(",").map((t) => t.trim()));
    }

    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? parseInt(minPrice) : priceStats.min,
        maxPrice ? parseInt(maxPrice) : priceStats.max,
      ]);
    }

    const provinceParam = searchParams.get("province");
    const cityParam = searchParams.get("city");
    if (provinceParam) setProvince(provinceParam);
    if (cityParam) setCity(cityParam);

    const checkInParam = searchParams.get("check_in");
    const checkOutParam = searchParams.get("check_out");
    if (checkInParam) setCheckIn(new Date(checkInParam));
    if (checkOutParam) setCheckOut(new Date(checkOutParam));

    const guestsParam = searchParams.get("guests");
    if (guestsParam) setGuests(parseInt(guestsParam));

    const petsParam = searchParams.get("pets");
    if (petsParam === "true") setPets(true);
  }, [searchParams, priceStats.min, priceStats.max]);

  const buildFilterUrl = () => {
    const params = new URLSearchParams();

    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    }

    if (priceRange[0] > priceStats.min || priceRange[1] < priceStats.max) {
      params.set("min_price", priceRange[0].toString());
      params.set("max_price", priceRange[1].toString());
    }

    if (province) params.set("province", province);
    if (city) params.set("city", city);

    if (checkIn) params.set("check_in", checkIn.toISOString().split("T")[0]);
    if (checkOut) params.set("check_out", checkOut.toISOString().split("T")[0]);

    if (guests > 1) params.set("guests", guests.toString());
    if (pets) params.set("pets", "true");

    return `/explore?${params.toString()}`;
  };

  const handleApply = () => {
    router.push(buildFilterUrl());
  };

  const handleReset = () => {
    setSelectedTags([]);
    setPriceRange([priceStats.min, priceStats.max]);
    setProvince(undefined);
    setCity(undefined);
    setCheckIn(undefined);
    setCheckOut(undefined);
    setGuests(2);
    setPets(false);
    router.push("/explore");
  };

  const activeFilterCount =
    selectedTags.length +
    (priceRange[0] > priceStats.min || priceRange[1] < priceStats.max ? 1 : 0) +
    (province ? 1 : 0) +
    (city ? 1 : 0) +
    (checkIn || checkOut ? 1 : 0) +
    (guests > 1 ? 1 : 0) +
    (pets ? 1 : 0);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          필터 {activeFilterCount > 0 && `(${activeFilterCount})`}
        </h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            초기화
          </Button>
        )}
      </div>

      <Separator />

      {/* Tag Filter */}
      <TagFilter tags={tags} selectedTags={selectedTags} onChange={setSelectedTags} />

      <Separator />

      {/* Price Range Filter */}
      <PriceRangeFilter
        minPrice={priceStats.min}
        maxPrice={priceStats.max}
        value={priceRange}
        onChange={setPriceRange}
      />

      <Separator />

      {/* Location Filter */}
      <LocationFilter
        province={province}
        city={city}
        onChange={(prov, cit) => {
          setProvince(prov);
          setCity(cit);
        }}
      />

      <Separator />

      {/* Date Filter */}
      <DateFilter
        checkIn={checkIn}
        checkOut={checkOut}
        onChange={(inDate, outDate) => {
          setCheckIn(inDate);
          setCheckOut(outDate);
        }}
      />

      <Separator />

      {/* Guest Filter */}
      <GuestFilter
        guests={guests}
        pets={pets}
        onChange={(g, p) => {
          setGuests(g);
          setPets(p);
        }}
      />

      <Separator />

      {/* Apply Button */}
      <Button onClick={handleApply} className="w-full" size="lg">
        적용하기
      </Button>
    </div>
  );
}
