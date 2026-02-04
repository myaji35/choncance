'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  onLoad?: () => void
  onClick?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  objectFit = 'cover',
  onLoad,
  onClick
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Generate sizes automatically based on common breakpoints
  const defaultSizes = fill
    ? sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : undefined

  // Fallback image
  const fallbackSrc = '/images/placeholder.jpg'

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Image */}
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        sizes={defaultSizes}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          fill && 'object-cover'
        )}
        style={{
          objectFit: fill ? objectFit : undefined
        }}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
      />
    </div>
  )
}