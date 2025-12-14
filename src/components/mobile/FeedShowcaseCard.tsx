import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Eye, ShoppingCart, ChevronRight, Star, Award, Bookmark, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

type CardType = "featured" | "promotion" | "education" | "auction";

interface FeedCardProps {
  id: string;
  type: CardType;
  title: string;
  description?: string;
  image: string;
  coinId?: string;
  coinPrice?: number;
  coinEra?: string;
  coinRarity?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

const typeConfig: Record<CardType, { label: string; icon: any; color: string }> = {
  featured: { label: "Featured", icon: Star, color: "text-gold" },
  promotion: { label: "Promotion", icon: Award, color: "text-primary" },
  education: { label: "Learn", icon: GraduationCap, color: "text-blue-400" },
  auction: { label: "Auction", icon: Bookmark, color: "text-red-400" },
};

export function FeedShowcaseCard({
  id,
  type,
  title,
  description,
  image,
  coinId,
  coinPrice,
  coinEra,
  coinRarity,
  ctaLabel = "View Details",
  ctaLink,
}: FeedCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-4 my-4"
    >
      <div className="card-gold-trim overflow-hidden shadow-xl">
        {/* Type badge ribbon */}
        <div className="absolute top-3 left-3 z-10">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            "bg-gradient-to-r from-gold/20 via-gold/15 to-gold/20 backdrop-blur-sm border-2 border-gold/40 shadow-lg"
          )}>
            <Icon className={cn("w-3.5 h-3.5", config.color)} />
            <span className={config.color}>{config.label}</span>
          </div>
        </div>

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          {/* Price tag for coins */}
          {coinPrice && (
            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-gold text-primary-foreground font-bold text-sm">
              ₹{coinPrice.toLocaleString()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-serif font-semibold text-lg leading-tight mb-1">
            {title}
          </h3>
          
          {coinEra && (
            <p className="text-sm text-muted-foreground mb-2">{coinEra}</p>
          )}

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>
          )}

          {/* Rarity badge */}
          {coinRarity && (
            <div className="inline-flex badge-rarity mb-3">
              <Star className="w-3 h-3" />
              {coinRarity}
            </div>
          )}

          {/* CTA */}
          <Link
            to={ctaLink || (coinId ? `/marketplace/coin/${coinId}` : "#")}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-gradient-to-r from-muted via-[hsl(var(--blue))] to-muted border-2 border-gold/30 hover:border-gold/50 hover:from-gold/15 hover:via-gold/10 hover:to-gold/15 transition-all group shadow-lg hover:shadow-[0_4px_16px_hsl(var(--gold)/0.2)]"
          >
            <span className="text-sm font-medium">{ctaLabel}</span>
            <ChevronRight className="w-5 h-5 text-gold transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

// Compact horizontal card for promotions
export function FeedCompactCard({
  id,
  type,
  title,
  image,
  coinPrice,
  ctaLink,
}: FeedCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Link
      to={ctaLink || "#"}
      className="mx-4 my-2 flex items-center gap-4 p-3 card-museum border-2 border-gold/20 hover:border-gold/40 transition-all group"
    >
      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 border-gold/20 group-hover:border-gold/40 transition-colors">
        <img src={image} alt="" className="w-full h-full object-cover" />
        <div className="absolute top-1 left-1 bg-gradient-to-br from-gold/20 to-gold/10 backdrop-blur-sm rounded-lg p-1 border border-gold/30">
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", config.color)}>
          {config.label}
        </span>
        <h4 className="font-serif font-semibold text-sm line-clamp-1 mt-0.5 group-hover:text-gold transition-colors">{title}</h4>
        {coinPrice && (
          <p className="text-gold font-bold mt-1">₹{coinPrice.toLocaleString()}</p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 group-hover:text-gold group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
