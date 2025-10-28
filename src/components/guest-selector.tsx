"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface GuestSelectorProps {
  value: GuestCounts;
  onChange: (value: GuestCounts) => void;
  trigger?: React.ReactNode;
}

export function GuestSelector({ value, onChange, trigger }: GuestSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateGuest = (key: keyof GuestCounts, delta: number) => {
    const newValue = Math.max(0, value[key] + delta);
    // Adults must be at least 1
    if (key === "adults" && newValue < 1) return;
    onChange({ ...value, [key]: newValue });
  };

  const totalGuests = value.adults + value.children + value.infants;

  const guestText = () => {
    const parts: string[] = [];
    if (totalGuests > 0) {
      parts.push(`게스트 ${totalGuests}명`);
    }
    if (value.pets > 0) {
      parts.push(`반려동물 ${value.pets}마리`);
    }
    return parts.length > 0 ? parts.join(", ") : "게스트 추가";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <button className="text-left w-full">
            <div className="text-xs font-semibold text-gray-900 mb-1">여행자</div>
            <div className="text-sm text-gray-500">{guestText()}</div>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="py-4">
          {/* Adults */}
          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
            <div className="flex-1">
              <div className="font-semibold text-base">성인</div>
              <div className="text-sm text-gray-600">13세 이상</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuest("adults", -1)}
                disabled={value.adults <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{value.adults}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuest("adults", 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
            <div className="flex-1">
              <div className="font-semibold text-base">어린이</div>
              <div className="text-sm text-gray-600">2~12세</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuest("children", -1)}
                disabled={value.children === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{value.children}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuest("children", 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Infants */}
          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
            <div className="flex-1">
              <div className="font-semibold text-base">유아</div>
              <div className="text-sm text-gray-600">2세 미만</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuest("infants", -1)}
                disabled={value.infants === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{value.infants}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuest("infants", 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Pets */}
          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 border-t">
            <div className="flex-1">
              <div className="font-semibold text-base">반려동물</div>
              <div className="text-sm text-gray-600 underline cursor-pointer">
                보조동물을 동반하시나요?
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuest("pets", -1)}
                disabled={value.pets === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{value.pets}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateGuest("pets", 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
