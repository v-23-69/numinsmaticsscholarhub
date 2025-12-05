import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, LayoutList, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FilterPanel } from "@/components/marketplace/FilterPanel";
import { CoinCard } from "@/components/coins/CoinCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { marketplaceCoins } from "@/data/mockCoins";

const Marketplace = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-hero border-b border-border/60 py-8 md:py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Coin Marketplace
              </h1>
              <p className="text-muted-foreground text-lg">
                Explore 15,000+ authenticated coins from trusted sellers across India
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6 md:py-8">
          <div className="container">
            <div className="flex gap-8">
              {/* Filters - Desktop */}
              <div className="hidden lg:block shrink-0">
                <FilterPanel isOpen={true} onClose={() => {}} />
              </div>

              {/* Listings */}
              <div className="flex-1 min-w-0">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    {/* Mobile Filter Toggle */}
                    <Button
                      variant="outline"
                      className="lg:hidden"
                      onClick={() => setIsFilterOpen(true)}
                    >
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      <strong className="text-foreground">15,240</strong> coins found
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sort */}
                    <Select defaultValue="newest">
                      <SelectTrigger className="w-44 bg-card">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="recommended">Expert Recommended</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="hidden sm:flex items-center border border-border rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          viewMode === "grid"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          viewMode === "list"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <LayoutList className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid */}
                <div
                  className={cn(
                    "grid gap-5",
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  )}
                >
                  {marketplaceCoins.map((coin, index) => (
                    <motion.div
                      key={coin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CoinCard {...coin} />
                    </motion.div>
                  ))}
                </div>

                {/* Load More */}
                <div className="mt-10 text-center">
                  <Button variant="outline" size="lg" className="px-8">
                    Load More Coins
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Filter Panel */}
      <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

      <Footer />
    </div>
  );
};

export default Marketplace;
