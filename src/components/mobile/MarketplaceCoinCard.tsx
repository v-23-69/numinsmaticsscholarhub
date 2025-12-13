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

  const isFeatured = rarity === "very-rare";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="card-gold-trim overflow-hidden group"
    >
      {/* Image slider */}
      <div className="relative aspect-square overflow-hidden bg-muted/50">
        <motion.img
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.4 }}
          src={images[currentImageIndex] || images[0]}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Premium overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Image navigation dots */}
        {images.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full"
          >
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex(idx);
                }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  idx === currentImageIndex 
                    ? "bg-gold w-4 shadow-gold-glow" 
                    : "bg-foreground/30 hover:bg-foreground/50"
                )}
              />
            ))}
          </motion.div>
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

        {/* Featured Badge */}
        {isFeatured && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute top-2 left-2 z-10"
          >
            <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-gold to-gold-light text-background text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-lg shadow-gold/50">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          </motion.div>
        )}

        {/* Rarity badge */}
        {rarity !== "common" && !isFeatured && (
          <div
            className={cn(
              "absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide border backdrop-blur-sm",
              rarityColors[rarity]
            )}
          >
            {rarity === "very-rare" ? "Very Rare" : "Rare"}
          </div>
        )}

        {/* Wishlist button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle?.();
          }}
          className={cn(
            "absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-sm",
            isWishlisted 
              ? "bg-gold text-primary-foreground shadow-lg shadow-gold/50" 
              : "bg-background/90 hover:bg-background border border-gold/20"
          )}
        >
          <Heart className={cn("w-4 h-4 transition-all", isWishlisted && "fill-current scale-110")} />
        </motion.button>
      </div>

      {/* Content */}
      <Link to={`/marketplace/coin/${id}`} className="block p-3.5 group/link">
        <h3 className="font-serif font-semibold text-sm line-clamp-1 group-hover/link:text-gold transition-colors">{title}</h3>
        
        {era && (
          <p className="text-xs text-muted-foreground mt-1">{era}</p>
        )}

        <div className="flex items-center justify-between mt-2.5">
          <span className="font-bold text-lg gold-text">
            ₹{price.toLocaleString()}
          </span>
          
          {metal && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide px-2 py-0.5 rounded bg-muted/50">
              {metal}
            </span>
          )}
        </div>

        {/* Seller info */}
        {seller && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-gold/10">
            {seller.isVerified && (
              <Shield className="w-3.5 h-3.5 text-gold" />
            )}
            <span className="text-[10px] text-muted-foreground truncate">
              {seller.name}
            </span>
            {seller.trustScore && (
              <div className="flex items-center gap-0.5 ml-auto">
                <Star className="w-3 h-3 text-gold fill-gold" />
                <span className="text-[10px] text-muted-foreground font-medium">
                  {seller.trustScore.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </Link>

      {/* Add to cart */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.preventDefault();
          onAddToCart?.();
        }}
        className="w-full py-3 border-t border-gold/10 flex items-center justify-center gap-2 text-sm font-medium text-gold hover:bg-gold/10 transition-all group/btn"
      >
        <ShoppingCart className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
        <span>Add to Cart</span>
      </motion.button>
    </motion.article>
  );
}
