import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoinCard } from "@/components/coins/CoinCard";
import { featuredCoins } from "@/data/mockCoins";

export function FeaturedCoins() {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <span className="text-sm font-medium text-gold-dark uppercase tracking-wider">
                Featured Collection
              </span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Curated Rare Finds
            </h2>
          </div>
          <Button variant="ghost" className="self-start sm:self-auto" asChild>
            <Link to="/marketplace" className="flex items-center gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCoins.map((coin, index) => (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CoinCard {...coin} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
