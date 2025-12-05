import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileNavBar } from "@/components/mobile/MobileNavBar";
import { MobileCoinCard } from "@/components/mobile/MobileCoinCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { marketplaceCoins } from "@/data/mockCoins";

const categories = [
  { id: "all", label: "All" },
  { id: "mughal", label: "Mughal" },
  { id: "british", label: "British" },
  { id: "sultanate", label: "Sultanate" },
  { id: "ancient", label: "Ancient" },
  { id: "modern", label: "Modern" },
];

const sortOptions = [
  { id: "newest", label: "Newest First" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "popular", label: "Most Popular" },
];

export default function MobileMarketplace() {
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showSort, setShowSort] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        title="Marketplace"
        showSearch
        onSearchClick={() => setShowSearch(true)}
      />

      {/* Category Pills */}
      <section className="sticky top-14 z-30 bg-background border-b border-border/40">
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-elegant">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Toolbar */}
      <section className="px-4 py-3 flex items-center justify-between border-b border-border/40">
        <span className="text-sm text-muted-foreground">
          <strong className="text-foreground">15,240</strong> coins
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSort(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm"
          >
            {sortOptions.find((s) => s.id === sortBy)?.label}
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </section>

      {/* Grid */}
      <main className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {marketplaceCoins.map((coin, index) => (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MobileCoinCard {...coin} />
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 text-center">
          <Button variant="outline" className="rounded-xl">
            Load More
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="safe-area-inset-top">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search coins, sellers, eras..."
                    className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                </div>
                <button onClick={() => setShowSearch(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Recent Searches */}
              <div className="px-4 py-4">
                <h3 className="text-sm font-semibold mb-3">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {["Mughal Gold", "Victoria Rupee", "Ancient Coins", "Shah Jahan"].map((term) => (
                    <button
                      key={term}
                      className="px-3 py-1.5 rounded-full bg-secondary text-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending */}
              <div className="px-4 py-4 border-t border-border/40">
                <h3 className="text-sm font-semibold mb-3">Trending Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(1).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setShowSearch(false);
                      }}
                      className="px-3 py-1.5 rounded-full bg-gold/10 text-gold-dark text-sm"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Bottom Sheet */}
      <AnimatePresence>
        {showSort && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/50"
            onClick={() => setShowSort(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 safe-area-inset-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
              <h3 className="font-serif font-semibold text-lg mb-4">Sort By</h3>
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSort(false);
                    }}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-colors",
                      sortBy === option.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/50"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto safe-area-inset-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif font-semibold text-lg">Filters</h3>
                <button className="text-sm text-primary">Clear All</button>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm"
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm"
                  />
                </div>
              </div>

              {/* Metal */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Metal</h4>
                <div className="flex flex-wrap gap-2">
                  {["Gold", "Silver", "Copper", "Bronze"].map((metal) => (
                    <button
                      key={metal}
                      className="px-4 py-2 rounded-full bg-secondary text-sm"
                    >
                      {metal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Condition</h4>
                <div className="flex flex-wrap gap-2">
                  {["UNC", "AU", "EF", "VF", "F"].map((cond) => (
                    <button
                      key={cond}
                      className="px-4 py-2 rounded-full bg-secondary text-sm"
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <Button
                className="w-full btn-gold rounded-xl h-12"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNavBar />
    </div>
  );
}
