"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface GuestFilterProps {
  guests: number;
  pets: boolean;
  onChange: (guests: number, pets: boolean) => void;
}

export function GuestFilter({ guests, pets, onChange }: GuestFilterProps) {
  const handleGuestsChange = (delta: number) => {
    const newGuests = Math.max(1, Math.min(20, guests + delta));
    onChange(newGuests, pets);
  };

  const handlePetsChange = (checked: boolean) => {
    onChange(guests, checked);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold">인원</Label>

      {/* Guest Count */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">게스트</span>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleGuestsChange(-1)}
              disabled={guests <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-sm font-medium">{guests}명</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleGuestsChange(1)}
              disabled={guests >= 20}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Pets Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="pets"
          checked={pets}
          onCheckedChange={(checked) => handlePetsChange(checked === true)}
        />
        <Label htmlFor="pets" className="text-sm font-normal cursor-pointer">
          반려동물 동반 🐕
        </Label>
      </div>
    </div>
  );
}
