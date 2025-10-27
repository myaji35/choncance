"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Tag, TagCategory } from "@/types";

interface TagFilterProps {
  tags: Record<TagCategory, Tag[]>;
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

const categoryLabels: Record<TagCategory, string> = {
  VIEW: "뷰",
  ACTIVITY: "액티비티",
  FACILITY: "시설",
  VIBE: "분위기",
};

export function TagFilter({ tags, selectedTags, onChange }: TagFilterProps) {
  const handleToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  return (
    <div className="space-y-6">
      <Label className="text-sm font-semibold">태그</Label>

      {Object.entries(tags).map(([category, categoryTags]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            {categoryLabels[category as TagCategory]}
          </h4>

          <div className="space-y-2">
            {categoryTags.map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={selectedTags.includes(tag.name)}
                  onCheckedChange={() => handleToggle(tag.name)}
                />
                <Label
                  htmlFor={`tag-${tag.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {tag.name} {tag.icon}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
