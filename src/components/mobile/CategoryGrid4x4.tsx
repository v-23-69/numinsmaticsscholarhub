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
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.03, type: "spring", stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05, y: -2 }}
              onClick={() => onCategorySelect(category.slug)}
              className={cn(
                "relative aspect-square rounded-xl flex flex-col items-center justify-center p-2.5 transition-all duration-300",
                "border-2 overflow-hidden group",
                isActive
                  ? "border-gold bg-gold/15 shadow-lg shadow-gold/30"
                  : "border-gold/30 bg-card hover:border-gold/60 hover:bg-gold/5"
              )}
            >
              {/* Premium gold frame effect for active */}
              {isActive && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-gold/10 rounded-xl"
                  />
                  {/* Animated gold border glow */}
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-xl border-2 border-gold/50"
                  />
                </>
              )}

              {/* Gold corner accents for active */}
              {isActive && (
                <>
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold rounded-br-xl" />
                </>
              )}

              {/* Hover glow effect */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-radial from-gold/10 to-transparent rounded-xl"
              />

              {/* Category emoji/icon placeholder */}
              <motion.span
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                className="text-xl mb-1.5 relative z-10"
              >
                {getCategoryEmoji(category.slug)}
              </motion.span>

              {/* Title */}
              <span
                className={cn(
                  "text-[10px] font-semibold text-center leading-tight line-clamp-2 relative z-10 transition-colors",
                  isActive ? "text-gold" : "text-muted-foreground group-hover:text-foreground"
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
