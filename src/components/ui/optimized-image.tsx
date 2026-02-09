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
  // NEW: Device Pixel Ratio support for high-PPI displays
  dpr?: 1 | 2 | 3 // 1x, 2x (Retina), 3x (Super Retina)
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
  onClick,
  dpr = 2 // Default to 2x (Retina) for modern devices
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Generate sizes automatically based on common breakpoints
  // Optimized for high-PPI mobile devices (iPhone, Samsung Galaxy)
  const defaultSizes = fill
    ? sizes || '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
    : undefined

  // Adjust quality based on DPR to maintain visual quality on Retina displays
  // Higher DPR = slightly lower JPEG quality (file size optimization)
  const adjustedQuality = dpr >= 2 ? Math.max(quality - 5, 70) : quality

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
        quality={adjustedQuality}
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