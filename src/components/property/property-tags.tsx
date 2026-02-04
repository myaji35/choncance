interface PropertyTagsProps {
  tags: string[];
}

export function PropertyTags({ tags }: PropertyTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
