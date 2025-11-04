"use client";

import type { Tag } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TagBadgeProps {
  tag: Tag;
  variant?: "default" | "outline";
  className?: string;
  onClick?: () => void;
}

/**
 * TagBadge component - displays a single tag with icon and color
 * Clicking on a tag navigates to filtered explore page
 */
export function TagBadge({ tag, variant = "default", className, onClick }: TagBadgeProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const badgeContent = (
    <>
      {tag.icon && <span className="mr-1">{tag.icon}</span>}
      {tag.name}
    </>
  );

  // If onClick is provided, use it; otherwise use Link
  if (onClick) {
    return (
      <Badge
        variant={variant}
        className={cn(
          "cursor-pointer transition-all hover:scale-105 hover:opacity-80",
          className
        )}
        style={{
          backgroundColor: variant === "default" ? tag.color : "transparent",
          borderColor: tag.color,
          color: variant === "default" ? "#ffffff" : tag.color,
        }}
        onClick={handleClick}
      >
        {badgeContent}
      </Badge>
    );
  }

  return (
    <Link href={`/explore?tag=${encodeURIComponent(tag.name)}`}>
      <Badge
        variant={variant}
        className={cn(
          "cursor-pointer transition-all hover:scale-105 hover:opacity-80",
          className
        )}
        style={{
          backgroundColor: variant === "default" ? tag.color : "transparent",
          borderColor: tag.color,
          color: variant === "default" ? "#ffffff" : tag.color,
        }}
      >
        {badgeContent}
      </Badge>
    </Link>
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
export function TagList({ tags, variant = "default", className, onTagClick, maxTags, size = "default" }: TagListProps & { maxTags?: number; size?: "sm" | "default" }) {
  const displayedTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

  return (
    <div className={cn("flex flex-wrap gap-1.5 sm:gap-2", className)}>
      {displayedTags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          variant={variant}
          className={cn(
            size === "sm" && "text-xs px-2 py-0.5"
          )}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className={cn("text-gray-500", size === "sm" && "text-xs px-2 py-0.5")}>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
