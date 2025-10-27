import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
  color?: string | null;
}

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const categoryColors: Record<string, string> = {
  VIEW: "bg-green-100 text-green-800 hover:bg-green-200",
  ACTIVITY: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  FACILITY: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  VIBE: "bg-blue-100 text-blue-800 hover:bg-blue-200",
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function TagBadge({ tag, onClick, className, size = "md" }: TagBadgeProps) {
  const colorClass = categoryColors[tag.category] || "bg-gray-100 text-gray-800 hover:bg-gray-200";

  return (
    <Badge
      variant="secondary"
      className={cn(
        colorClass,
        sizeClasses[size],
        "cursor-pointer transition-colors font-medium",
        onClick && "hover:scale-105 transition-transform",
        className
      )}
      onClick={onClick}
    >
      {tag.icon && <span className="mr-1">{tag.icon}</span>}
      {tag.name}
    </Badge>
  );
}

interface TagListProps {
  tags: Tag[];
  onTagClick?: (tag: Tag) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  maxTags?: number;
}

export function TagList({ tags, onTagClick, className, size = "md", maxTags }: TagListProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {displayTags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          onClick={() => onTagClick?.(tag)}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className={cn(sizeClasses[size])}>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
