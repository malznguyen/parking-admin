'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Camera } from 'lucide-react';
import { getFallbackImage } from '@/lib/utils/image-helpers';

interface ParkingImageProps {
  src: string;
  alt: string;
  type?: 'entry' | 'exit' | 'exception';
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  objectFit?: 'contain' | 'cover';
}

/**
 * Reusable image component for parking system images
 * Handles loading states, errors, and fallbacks gracefully
 */
export function ParkingImage({
  src,
  alt,
  type = 'entry',
  className = '',
  priority = false,
  fill = true,
  width,
  height,
  objectFit = 'contain',
}: ParkingImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Use fallback placeholder service when image fails to load
  const fallbackSrc = getFallbackImage(type, width || 800, height || 600);

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 rounded-lg">
          <Camera className="h-12 w-12 text-slate-300 mb-2" />
          <p className="text-sm text-slate-400">Không thể tải ảnh</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg animate-pulse">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500">Đang tải ảnh...</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} ${objectFit === 'contain' ? 'object-contain' : 'object-cover'}`}
        onLoadingComplete={() => setLoading(false)}
        onError={() => {
          // Try fallback placeholder
          const img = new window.Image();
          img.onload = () => setLoading(false);
          img.onerror = () => {
            setError(true);
            setLoading(false);
          };
          img.src = fallbackSrc;

          // Update the image source to fallback
          setError(false);
          (document.querySelector(`img[alt="${alt}"]`) as HTMLImageElement)?.setAttribute('src', fallbackSrc);
        }}
        priority={priority}
      />
    </div>
  );
}

/**
 * Simple loading skeleton for images
 */
export function ImageSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg w-full h-full flex items-center justify-center ${className}`}>
      <Camera className="w-12 h-12 text-slate-300" />
    </div>
  );
}

/**
 * Error fallback component for images
 */
export function ImageError({ message, className = '' }: { message?: string; className?: string }) {
  return (
    <div className={`bg-slate-50 rounded-lg w-full h-full flex flex-col items-center justify-center text-slate-400 ${className}`}>
      <svg
        className="w-12 h-12 mb-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="text-sm">{message || 'Không thể tải ảnh'}</p>
    </div>
  );
}

/**
 * Thumbnail component for small image previews
 */
export function ParkingThumbnail({
  src,
  alt,
  type = 'entry',
  className = 'w-16 h-12',
}: Omit<ParkingImageProps, 'fill' | 'width' | 'height'>) {
  return (
    <div className={`relative ${className} flex-shrink-0 bg-slate-100 rounded overflow-hidden border border-slate-200`}>
      <ParkingImage
        src={src}
        alt={alt}
        type={type}
        fill
        objectFit="cover"
      />
    </div>
  );
}
