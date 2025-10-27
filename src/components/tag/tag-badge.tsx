"use client";

import type { Tag } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: Tag;
  variant?: "default" | "outline";
  className?: string;
  onClick?: () => void;
}

/**
 * TagBadge component - displays a single tag with icon and color
 */
export function TagBadge({ tag, variant = "default", className, onClick }: TagBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "cursor-pointer transition-all hover:scale-105",
        onClick && "hover:opacity-80",
        className
      )}
      style={{
        backgroundColor: variant === "default" ? tag.color : "transparent",
        borderColor: tag.color,
        color: variant === "default" ? "#ffffff" : tag.color,
      }}
      onClick={onClick}
    >
      {tag.icon && <span className="mr-1">{tag.icon}</span>}
      {tag.name}
    </Badge>
  );
}

interface TagListProps {
  tags: Tag[];
  variant?: "default" | "outline";
  className?: string;
  onTagClick?: (tag: Tag) => void;
}

/**
 * TagList component - displays a list of tags
 */
export function TagList({ tags, variant = "default", className, onTagClick }: TagListProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          variant={variant}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        />
      ))}
    </div>
  );
}
