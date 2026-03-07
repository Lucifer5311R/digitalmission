import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({ rating, maxRating = 5, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const gaps = { sm: 'gap-0.5', md: 'gap-1', lg: 'gap-1.5' };

  return (
    <div className={`flex items-center ${gaps[size]}`}>
      {Array.from({ length: maxRating }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => interactive && onChange?.(i + 1)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center' : 'cursor-default'}`}
          disabled={!interactive}
        >
          <Star
            className={`${sizes[size]} ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
