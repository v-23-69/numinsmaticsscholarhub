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
  common: "bg-card border-gold/20 text-muted-foreground",
  rare: "bg-gradient-to-r from-gold/20 via-gold/15 to-gold/20 text-gold border-gold/30",
  "very-rare": "bg-gradient-to-r from-gold/30 via-gold-light/30 to-gold/30 text-gold border-gold/40 shadow-[0_0_15px_hsl(var(--gold)/0.3)]",
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
      whileHover={{ y: -6, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="card-premium overflow-hidden group"
    >
      {/* Premium Image slider */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted via-[hsl(var(--blue-light))] to-muted">
        <motion.img
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={images[currentImageIndex] || images[0]}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Image navigation dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex(idx);
                }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  idx === currentImageIndex 
                    ? "bg-gold w-6 shadow-[0_0_8px_rgba(212,175,55,0.6)]" 
                    : "bg-white/40 hover:bg-white/60"
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
              className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSwipe("left");
              }}
              className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
            />
          </>
        )}

        {/* Premium Rarity badge */}
        {rarity !== "common" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "absolute top-3 left-3 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border backdrop-blur-sm",
              rarityColors[rarity]
            )}
          >
            {rarity === "very-rare" ? "Very Rare" : "Rare"}
          </motion.div>
        )}

        {/* Premium Wishlist button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle?.();
          }}
          className={cn(
            "absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm z-10 shadow-lg",
            isWishlisted 
              ? "bg-gradient-to-br from-gold to-gold-light text-primary-foreground shadow-[0_4px_16px_hsl(var(--gold)/0.5)]" 
              : "bg-card/80 border border-gold/30 text-foreground hover:border-gold/50"
          )}
        >
          <Heart className={cn("w-5 h-5 transition-all", isWishlisted && "fill-current")} />
        </motion.button>
      </div>

      {/* Premium Content */}
      <Link to={`/marketplace/coin/${id}`} className="block p-4">
        <h3 className="font-serif font-bold text-base line-clamp-1 mb-1 text-foreground group-hover:text-gold transition-colors">
          {title}
        </h3>
        
        {era && (
          <p className="text-xs text-muted-foreground mb-2">{era}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-lg bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
            ₹{price.toLocaleString()}
          </span>
          
          {metal && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide px-2 py-1 rounded-lg bg-card border border-gold/20">
              {metal}
            </span>
          )}
        </div>

        {/* Premium Seller info */}
        {seller && (
          <div className="flex items-center gap-2 pt-3 border-t border-gold/20">
            {seller.isVerified && (
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <Shield className="w-3 h-3 text-black" />
              </div>
            )}
            <span className="text-[11px] text-muted-foreground truncate flex-1">
              {seller.name}
            </span>
            {seller.trustScore && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                <span className="text-[11px] font-semibold text-gold">
                  {seller.trustScore.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </Link>

      {/* Premium Add to cart */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.preventDefault();
          onAddToCart?.();
        }}
        className="w-full py-3.5 border-t border-gold/20 bg-gradient-to-r from-muted via-[hsl(var(--blue))] to-muted flex items-center justify-center gap-2 text-sm font-semibold text-gold hover:from-gold/10 hover:via-gold/5 hover:to-gold/10 transition-all group"
      >
        <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
        Add to Cart
      </motion.button>
    </motion.article>
  );
}
