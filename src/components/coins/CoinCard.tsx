import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Eye, Shield, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoinCardProps {
  id: string;
  title: string;
  era: string;
  price: number;
  frontImage: string;
  backImage: string;
  sellerName: string;
  sellerTrustScore: number;
  isVerified: boolean;
  isWishlisted?: boolean;
  views?: number;
}

export function CoinCard({
  id,
  title,
  era,
  price,
  frontImage,
  backImage,
  sellerName,
  sellerTrustScore,
  isVerified,
  isWishlisted = false,
  views = 0,
}: CoinCardProps) {
  const [wishlisted, setWishlisted] = useState(isWishlisted);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Link to={`/marketplace/coin/${id}`} className="block">
        <div className="card-elevated overflow-hidden">
          {/* Image Container with Flip Effect */}
          <div className="coin-card-container relative aspect-square overflow-hidden bg-stone-light/30">
            <div className="coin-card-inner w-full h-full relative">
              {/* Front Image */}
              <div className="coin-card-front absolute inset-0">
                <img
                  src={frontImage}
                  alt={`${title} - Front`}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Back Image */}
              <div className="coin-card-back absolute inset-0">
                <img
                  src={backImage}
                  alt={`${title} - Back`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {isVerified && (
                <span className="badge-verified flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setWishlisted(!wishlisted);
              }}
              className={cn(
                "absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
                wishlisted
                  ? "bg-accent text-charcoal"
                  : "bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-accent"
              )}
            >
              <Heart className={cn("w-4 h-4", wishlisted && "fill-current")} />
            </button>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            {/* Quick View Hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
              <span className="text-xs font-medium text-primary-foreground bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                Hover to flip
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-accent uppercase tracking-wider">
                {era}
              </span>
              {views > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  {views}
                </span>
              )}
            </div>

            <h3 className="font-serif font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
              {title}
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gold-dark">
                {formatPrice(price)}
              </span>
            </div>

            {/* Seller Info */}
            <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate">
                {sellerName}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-accent fill-accent" />
                <span className="text-xs font-medium">{sellerTrustScore.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
