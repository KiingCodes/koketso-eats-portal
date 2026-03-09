import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  showValue = false,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.round(rating);
          const isPartial = starValue > rating && starValue - 1 < rating;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(starValue)}
              disabled={!interactive}
              className={cn(
                "relative",
                interactive && "cursor-pointer hover:scale-110 transition-transform"
              )}
            >
              {isPartial ? (
                <div className="relative">
                  <Star size={size} className="text-muted" fill="currentColor" />
                  <div
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{ width: `${(rating % 1) * 100}%` }}
                  >
                    <Star size={size} className="text-yellow-500" fill="currentColor" />
                  </div>
                </div>
              ) : (
                <Star
                  size={size}
                  className={cn(
                    isFilled ? "text-yellow-500" : "text-muted",
                    "transition-colors"
                  )}
                  fill={isFilled ? "currentColor" : "none"}
                />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
