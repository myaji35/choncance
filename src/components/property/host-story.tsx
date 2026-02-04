interface HostStoryProps {
  hostStory: string;
}

export function HostStory({ hostStory }: HostStoryProps) {
  if (!hostStory) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">호스트 이야기</h2>
      <div className="prose prose-lg max-w-none">
        {hostStory.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
