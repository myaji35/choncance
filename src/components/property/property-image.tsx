
import Image from 'next/image';

interface PropertyImageProps {
  src: string;
  alt: string;
}

export function PropertyImage({ src, alt }: PropertyImageProps) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
      />
    </div>
  );
}
