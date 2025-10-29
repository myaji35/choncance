"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  propertyId: string;
  variant?: "default" | "overlay";
  size?: "default" | "sm" | "lg";
  className?: string;
  showToast?: boolean;
}

export function WishlistButton({
  propertyId,
  variant = "default",
  size = "default",
  className,
  showToast = true,
}: WishlistButtonProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if property is in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!isLoaded || !user) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/wishlist/property/${propertyId}`
        );
        const data = await response.json();

        if (response.ok) {
          setIsWishlisted(data.isWishlisted);
          setWishlistId(data.wishlistId);
        }
      } catch (error) {
        console.error("Failed to check wishlist:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkWishlist();
  }, [propertyId, user, isLoaded]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Require authentication
    if (!user) {
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const response = await fetch(
          `/api/wishlist/property/${propertyId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setIsWishlisted(false);
          setWishlistId(null);
          if (showToast) {
            // You can add a toast notification here
            console.log("Removed from wishlist");
          }
          router.refresh();
        } else {
          throw new Error("Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ propertyId }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsWishlisted(true);
          setWishlistId(data.wishlist.id);
          if (showToast) {
            // You can add a toast notification here
            console.log("Added to wishlist");
          }
          router.refresh();
        } else {
          throw new Error(data.error || "Failed to add to wishlist");
        }
      }
    } catch (error: any) {
      console.error("Wishlist toggle error:", error);
      if (showToast) {
        alert(error.message || "찜하기 처리 중 오류가 발생했습니다");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    default: "h-10 w-10",
    sm: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    default: "w-5 h-5",
    sm: "w-4 h-4",
    lg: "w-6 h-6",
  };

  if (variant === "overlay") {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading || isChecking}
        className={cn(
          "absolute top-3 right-3 z-10",
          "bg-white/90 backdrop-blur-sm",
          "rounded-full shadow-lg",
          "flex items-center justify-center",
          "transition-all duration-200",
          "hover:bg-white hover:scale-110",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size],
          className
        )}
        aria-label={isWishlisted ? "찜 취소" : "찜하기"}
      >
        <Heart
          className={cn(
            iconSizes[size],
            "transition-all",
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-gray-700 hover:text-red-500"
          )}
        />
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size === "default" ? "default" : size}
      onClick={handleToggle}
      disabled={isLoading || isChecking}
      className={cn(
        "gap-2",
        isWishlisted && "border-red-500 bg-red-50 hover:bg-red-100",
        className
      )}
      aria-label={isWishlisted ? "찜 취소" : "찜하기"}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all",
          isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"
        )}
      />
      {isWishlisted ? "찜 완료" : "찜하기"}
    </Button>
  );
}
