import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
  categories: { id: string; slug: string; title: string; icon?: string }[];
  activeCategory: string;
  onCategorySelect: (slug: string) => void;
}

export function CategoryGrid4x4({ categories, activeCategory, onCategorySelect }: CategoryGridProps) {
  return (
    <section className="px-4 py-4">
      <h2 className="font-serif font-semibold text-lg mb-3">Categories</h2>
      <div className="grid grid-cols-4 gap-2">
        {categories.slice(0, 16).map((category, index) => {
          const isActive = activeCategory === category.slug;
          
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategorySelect(category.slug)}
              className={cn(
                "relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-300",
                "border overflow-hidden",
                isActive
                  ? "border-gold bg-gold/10 shadow-gold"
                  : "border-border/60 bg-card hover:border-gold/50"
              )}
            >
              {/* Active glow effect */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-gradient-radial from-gold/20 to-transparent"
                />
              )}

              {/* Gold corner accents for active */}
              {isActive && (
                <>
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-gold rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-gold rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-gold rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-gold rounded-br-lg" />
                </>
              )}

              {/* Category emoji/icon placeholder */}
              <span className="text-lg mb-1">
                {getCategoryEmoji(category.slug)}
              </span>

              {/* Title */}
              <span
                className={cn(
                  "text-[9px] font-medium text-center leading-tight line-clamp-2",
                  isActive ? "text-gold" : "text-muted-foreground"
                )}
              >
                {category.title}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

function getCategoryEmoji(slug: string): string {
  const emojiMap: Record<string, string> = {
    medals: "🎖️",
    sultanates: "🏰",
    "early-medieval": "⚔️",
    "east-india-company": "🚢",
    "hindu-coins-medieval": "🕉️",
    "independent-kingdoms": "👑",
    "indo-french": "🇫🇷",
    "princely-states": "🏛️",
    "islamic-world": "☪️",
    "indo-portuguese": "🇵🇹",
    "british-india": "🇬🇧",
    "mughal-india": "🌙",
    "ancient-india": "🏺",
    "republic-india": "🇮🇳",
    "indo-dutch": "🇳🇱",
    "foreign-coins": "🌍",
  };
  return emojiMap[slug] || "🪙";
}
