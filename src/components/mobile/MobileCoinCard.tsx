import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Shield, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileCoinCardProps {
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
}

export function MobileCoinCard({
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
}: MobileCoinCardProps) {
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [showBack, setShowBack] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group"
    >
      <Link to={`/marketplace/coin/${id}`} className="block">
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
          {/* Image Container with Tap-to-Flip */}
          <div
            className="relative aspect-square overflow-hidden bg-stone-light/30"
            onClick={(e) => {
              e.preventDefault();
              setShowBack(!showBack);
            }}
          >
            <motion.img
              src={showBack ? backImage : frontImage}
              alt={title}
              className="w-full h-full object-cover"
              initial={false}
              animate={{ rotateY: showBack ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              style={{ backfaceVisibility: "hidden" }}
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald/90 text-primary-foreground rounded-full">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setWishlisted(!wishlisted);
              }}
              className={cn(
                "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                wishlisted
                  ? "bg-accent text-charcoal"
                  : "bg-background/70 backdrop-blur-sm text-muted-foreground"
              )}
            >
              <Heart className={cn("w-4 h-4", wishlisted && "fill-current")} />
            </button>

            {/* Tap hint */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <span className="text-[10px] font-medium text-primary-foreground/80 bg-charcoal/60 backdrop-blur-sm px-2 py-1 rounded-full">
                Tap to flip
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            <span className="text-[10px] font-medium text-accent uppercase tracking-wider">
              {era}
            </span>
            <h3 className="font-medium text-sm text-foreground line-clamp-2 mt-0.5 mb-2 min-h-[2.5rem]">
              {title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gold-dark">
                {formatPrice(price)}
              </span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="w-3 h-3 text-accent fill-accent" />
                <span className="text-xs">{sellerTrustScore}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
