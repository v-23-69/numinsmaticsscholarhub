import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye, ChevronLeft, ChevronRight, Star, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoinCardProps {
  id: string;
  title: string;
  era?: string;
  price: number;
  images: string[];
  rarity?: "common" | "rare" | "very-rare";
  metal?: string;
  seller?: {
    name: string;
    isVerified: boolean;
    trustScore?: number;
  };
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  onAddToCart?: () => void;
}

const rarityColors = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-gold/20 text-gold border-gold/30",
  "very-rare": "bg-gradient-to-r from-gold/30 to-gold-light/30 text-gold border-gold/40",
};

export function MarketplaceCoinCard({
  id,
  title,
  era,
  price,
  images,
  rarity = "common",
  metal,
  seller,
  isWishlisted = false,
  onWishlistToggle,
  onAddToCart,
}: CoinCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left" && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (direction === "right" && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="card-gold-trim overflow-hidden"
    >
      {/* Image slider */}
      <div className="relative aspect-square overflow-hidden bg-muted/50">
        <motion.img
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          src={images[currentImageIndex]}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Image navigation dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex(idx);
                }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  idx === currentImageIndex ? "bg-gold" : "bg-foreground/30"
                )}
              />
            ))}
          </div>
        )}

        {/* Swipe areas */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSwipe("right");
              }}
              className="absolute left-0 top-0 bottom-0 w-1/3"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSwipe("left");
              }}
              className="absolute right-0 top-0 bottom-0 w-1/3"
            />
          </>
        )}

        {/* Rarity badge */}
        {rarity !== "common" && (
          <div
            className={cn(
              "absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border",
              rarityColors[rarity]
            )}
          >
            {rarity === "very-rare" ? "Very Rare" : "Rare"}
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle?.();
          }}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all",
            isWishlisted 
              ? "bg-gold text-primary-foreground" 
              : "bg-background/80 backdrop-blur-sm"
          )}
        >
          <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <Link to={`/marketplace/coin/${id}`} className="block p-3">
        <h3 className="font-serif font-semibold text-sm line-clamp-1">{title}</h3>
        
        {era && (
          <p className="text-xs text-muted-foreground mt-0.5">{era}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-gold">
            ₹{price.toLocaleString()}
          </span>
          
          {metal && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {metal}
            </span>
          )}
        </div>

        {/* Seller info */}
        {seller && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/40">
            {seller.isVerified && (
              <Shield className="w-3 h-3 text-primary" />
            )}
            <span className="text-[10px] text-muted-foreground truncate">
              {seller.name}
            </span>
            {seller.trustScore && (
              <div className="flex items-center gap-0.5 ml-auto">
                <Star className="w-3 h-3 text-gold fill-gold" />
                <span className="text-[10px] text-muted-foreground">
                  {seller.trustScore.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </Link>

      {/* Add to cart */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onAddToCart?.();
        }}
        className="w-full py-2.5 border-t border-border/40 flex items-center justify-center gap-2 text-sm font-medium text-gold hover:bg-gold/10 transition-colors"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </button>
    </motion.article>
  );
}
