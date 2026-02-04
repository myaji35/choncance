"use client";

import { useState } from "react";
import { Search, Navigation, Landmark, Mountain, Waves, TreePine, Building2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface Location {
  id: string;
  name: string;
  description: string;
  icon: "navigation" | "landmark" | "mountain" | "waves" | "tree" | "building";
}

const POPULAR_LOCATIONS: Location[] = [
  {
    id: "nearby",
    name: "근처 체험 찾기",
    description: "가까운 곳에서 즐길 수 있는 체험을 찾아보세요.",
    icon: "navigation",
  },
  {
    id: "busan",
    name: "부산",
    description: "해변으로 인기 있는 곳",
    icon: "waves",
  },
  {
    id: "gwangalli",
    name: "광안리해수욕장, 부산",
    description: "해변의 매력을 느낄 수 있는 곳",
    icon: "waves",
  },
  {
    id: "gangneung",
    name: "강릉시, 강원도",
    description: "자연을 만끽하기 좋은 곳",
    icon: "mountain",
  },
  {
    id: "sokcho",
    name: "속초시, 강원도",
    description: "호수로 인기 있는 곳",
    icon: "waves",
  },
  {
    id: "jeonju",
    name: "전주시, 전라북도",
    description: "한옥마을과 전통 문화 체험",
    icon: "landmark",
  },
  {
    id: "jeju",
    name: "제주도",
    description: "자연과 힐링의 섬",
    icon: "tree",
  },
  {
    id: "gyeongju",
    name: "경주시, 경상북도",
    description: "역사와 문화 유적지",
    icon: "landmark",
  },
  {
    id: "yeosu",
    name: "여수시, 전라남도",
    description: "바다와 야경이 아름다운 곳",
    icon: "waves",
  },
  {
    id: "pyeongchang",
    name: "평창군, 강원도",
    description: "산과 자연 속 휴식",
    icon: "mountain",
  },
  {
    id: "gapyeong",
    name: "가평군, 경기도",
    description: "서울 근교 힐링 명소",
    icon: "tree",
  },
  {
    id: "damyang",
    name: "담양군, 전라남도",
    description: "대나무숲과 자연 체험",
    icon: "tree",
  },
];

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const getIcon = (iconName: string) => {
  const iconProps = { className: "h-8 w-8 text-gray-600" };
  switch (iconName) {
    case "navigation":
      return <Navigation {...iconProps} />;
    case "landmark":
      return <Landmark {...iconProps} />;
    case "mountain":
      return <Mountain {...iconProps} />;
    case "waves":
      return <Waves {...iconProps} />;
    case "tree":
      return <TreePine {...iconProps} />;
    case "building":
      return <Building2 {...iconProps} />;
    default:
      return <Navigation {...iconProps} />;
  }
};

export function LocationSelector({ value, onChange, onFocus, onBlur }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = POPULAR_LOCATIONS.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (location: Location) => {
    onChange(location.name);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="text-left w-full"
          onFocus={() => {
            setIsOpen(true);
            onFocus?.();
          }}
        >
          <div className="text-xs font-semibold text-gray-900 mb-1">여행지</div>
          <input
            type="text"
            placeholder="어디로 검색"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-sm bg-transparent border-none outline-none placeholder:text-gray-500 p-0"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[440px] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[480px] overflow-y-auto">
          {/* Search Input */}
          <div className="p-4 border-b sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="여행지 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Popular Locations */}
          <div className="py-2">
            <div className="px-6 py-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                추천 여행지
              </h3>
            </div>

            {filteredLocations.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSelect(location)}
                  className="w-full px-6 py-3 hover:bg-gray-50 transition-colors flex items-start gap-4 text-left"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getIcon(location.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mb-1">
                      {location.name}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {location.description}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
