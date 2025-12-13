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
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="mx-4 my-4"
    >
      <div className="card-gold-trim overflow-hidden group">
        {/* Type badge ribbon */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="absolute top-3 left-3 z-10"
        >
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            "bg-card/95 backdrop-blur-md border border-gold/40 shadow-lg shadow-gold/20"
          )}>
            <Icon className={cn("w-3.5 h-3.5", config.color)} />
            <span className={config.color}>{config.label}</span>
          </div>
        </motion.div>

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

          {/* Price tag for coins */}
          {coinPrice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-gold text-primary-foreground font-bold text-sm shadow-lg shadow-gold/50"
            >
              ₹{coinPrice.toLocaleString()}
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-serif font-semibold text-lg leading-tight mb-2 group-hover:text-gold transition-colors">
            {title}
          </h3>
          
          {coinEra && (
            <p className="text-sm text-muted-foreground mb-2">{coinEra}</p>
          )}

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {description}
            </p>
          )}

          {/* Rarity badge */}
          {coinRarity && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex badge-rarity mb-4"
            >
              <Star className="w-3 h-3" />
              {coinRarity}
            </motion.div>
          )}

          {/* CTA */}
          <Link
            to={ctaLink || (coinId ? `/marketplace/coin/${coinId}` : "#")}
            className="flex items-center justify-between w-full p-3.5 rounded-xl bg-muted/50 hover:bg-gold/10 border border-gold/20 hover:border-gold/40 transition-all group/cta"
          >
            <span className="text-sm font-medium group-hover/cta:text-gold transition-colors">{ctaLabel}</span>
            <ChevronRight className="w-5 h-5 text-gold transition-transform group-hover/cta:translate-x-1" />
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
      className="mx-4 my-2 flex items-center gap-4 p-3 card-museum"
    >
      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
        <img src={image} alt="" className="w-full h-full object-cover" />
        <div className="absolute top-1 left-1">
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", config.color)}>
          {config.label}
        </span>
        <h4 className="font-serif font-semibold text-sm line-clamp-1 mt-0.5">{title}</h4>
        {coinPrice && (
          <p className="text-gold font-bold mt-1">₹{coinPrice.toLocaleString()}</p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </Link>
  );
}
