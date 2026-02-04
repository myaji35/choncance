"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface LocationOption {
  name: string;
  count: number;
}

interface LocationFilterProps {
  province?: string;
  city?: string;
  onChange: (province?: string, city?: string) => void;
}

export function LocationFilter({ province, city, onChange }: LocationFilterProps) {
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(province);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(city);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("/api/filters/locations");
        const data = await response.json();
        setProvinces(data.provinces || []);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedProvince) {
        setCities([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/filters/locations?province=${encodeURIComponent(selectedProvince)}`
        );
        const data = await response.json();
        setCities(data.cities || []);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, [selectedProvince]);

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedCity(undefined);
    onChange(value, undefined);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    onChange(selectedProvince, value);
  };

  const handleClear = () => {
    setSelectedProvince(undefined);
    setSelectedCity(undefined);
    onChange(undefined, undefined);
  };

  // Popular locations
  const popularLocations = [
    { name: "강릉", province: "강원도", city: "강릉시" },
    { name: "담양", province: "전라남도", city: "담양군" },
    { name: "제주", province: "제주특별자치도", city: "제주시" },
    { name: "경주", province: "경상북도", city: "경주시" },
  ];

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold">지역</Label>

      {/* Popular Locations */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">인기 지역</p>
        <div className="flex flex-wrap gap-2">
          {popularLocations.map((loc) => (
            <Button
              key={loc.name}
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedProvince(loc.province);
                setSelectedCity(loc.city);
                onChange(loc.province, loc.city);
              }}
              className="text-xs"
            >
              {loc.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Province Select */}
      <div className="space-y-2">
        <Label htmlFor="province" className="text-xs text-gray-600">
          시/도
        </Label>
        <Select value={selectedProvince} onValueChange={handleProvinceChange}>
          <SelectTrigger id="province">
            <SelectValue placeholder="시/도 선택" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((prov) => (
              <SelectItem key={prov.name} value={prov.name}>
                {prov.name} ({prov.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City Select */}
      {selectedProvince && (
        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs text-gray-600">
            시/군/구
          </Label>
          <Select
            value={selectedCity}
            onValueChange={handleCityChange}
            disabled={isLoading || cities.length === 0}
          >
            <SelectTrigger id="city">
              <SelectValue
                placeholder={
                  isLoading ? "로딩 중..." : cities.length === 0 ? "시/군/구 없음" : "시/군/구 선택"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Clear Button */}
      {(selectedProvince || selectedCity) && (
        <Button variant="ghost" size="sm" onClick={handleClear} className="w-full">
          지역 초기화
        </Button>
      )}
    </div>
  );
}
