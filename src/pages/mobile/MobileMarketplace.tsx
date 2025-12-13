import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown, Grid, Loader2 } from "lucide-react";
import { PremiumNavBar } from "@/components/mobile/PremiumNavBar";
import { MarketplaceCoinCard } from "@/components/mobile/MarketplaceCoinCard";
import { CategoryGrid4x4 } from "@/components/mobile/CategoryGrid4x4";
import { CartDrawer } from "@/components/shopify/CartDrawer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { categories as mockCategories } from "@/data/nshMockData";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/stores/cartStore";
import coinMughalFront from "@/assets/coin-mughal-front.jpg";
import { supabase } from "@/integrations/supabase/client";

const sortOptions = [
  { id: "newest", label: "Newest First" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "oldest", label: "Oldest First" },
];

const metalOptions = ["Gold", "Silver", "Copper", "Bronze"];
const rarityOptions = ["Common", "Rare", "Very Rare"];

export default function MobileMarketplace() {
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showCategories, setShowCategories] = useState(true);

  // Real Data State
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedMetals, setSelectedMetals] = useState<string[]>([]);
  const [selectedRarity, setSelectedRarity] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [wishlist, setWishlist] = useState<string[]>([]);
  const { toast } = useToast();
  const addItem = useCartStore(state => state.addItem);

  // Fetch Data
  useEffect(() => {
    const fetchMarketplaceData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Categories
        const { data: catData } = await supabase
          .from('coin_categories')
          .select('*');

        if (catData && catData.length > 0) {
          setCategories([{ id: 'all', slug: 'all', name: 'All Coins' }, ...catData]);
        } else {
          // Fallback to mock categories if DB is empty
          setCategories([{ id: "all", slug: "all", title: "All Coins" }, ...mockCategories]);
        }

        // 2. Build Query for Listings
        let query = supabase
          .from('coin_listings')
          .select(`
                    *,
                    coin_images ( url, display_order ),
                    seller:seller_id ( display_name, avatar_url, trust_score )
                `)
          .eq('status', 'active');

        // Apply Filters
        if (activeCategory !== 'all') {
          query = query.eq('category_id', activeCategory);
        }

        // Sort
        if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
        if (sortBy === 'oldest') query = query.order('created_at', { ascending: true });
        if (sortBy === 'price-low') query = query.order('price', { ascending: true });
        if (sortBy === 'price-high') query = query.order('price', { ascending: false });

        const { data: listingData, error } = await query;

        if (error) console.error("Error fetching listings:", error);

        if (listingData) {
          // Client-side filtering for complex text/array searches that are harder in single SQL query
          let filtered = listingData;

          // Price Range
          filtered = filtered.filter(l => l.price >= priceRange[0] && l.price <= priceRange[1]);

          // Metals
          if (selectedMetals.length > 0) {
            filtered = filtered.filter(l => l.metal_type && selectedMetals.includes(l.metal_type));
          }

          // Search Text
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(l =>
              l.title.toLowerCase().includes(q) ||
              l.description?.toLowerCase().includes(q)
            );
          }

          setListings(filtered);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceData();
  }, [activeCategory, sortBy, showFilters, searchQuery]); // Re-run when these change

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
    setShowCategories(false);
  };

  const toggleWishlist = (coinId: string) => {
    setWishlist(prev =>
      prev.includes(coinId)
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
    toast({
      title: wishlist.includes(coinId) ? "Removed from wishlist" : "Added to wishlist",
      duration: 2000,
    });
  };

  const handleAddToCart = (listing: any) => {
    // Adapter to match Shopify cart expected format
    const mainImage = listing.coin_images?.[0]?.url || "";

    addItem({
      product: {
        node: {
          id: listing.id,
          title: listing.title,
          description: listing.description || "",
          handle: listing.id,
          priceRange: {
            minVariantPrice: {
              amount: listing.price.toString(),
              currencyCode: listing.currency || "INR",
            },
          },
          images: {
            edges: listing.coin_images?.map((img: any) => ({
              node: { url: img.url, altText: listing.title }
            })) || [],
          },
          variants: { edges: [] },
          options: [],
        },
      },
      variantId: `gid://shopify/ProductVariant/${listing.id}`, // Fake ID for now
      variantTitle: "Default",
      price: { amount: listing.price.toString(), currencyCode: listing.currency || "INR" },
      quantity: 1,
      selectedOptions: [],
    });
    toast({
      title: "Added to cart",
      description: listing.title,
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Coin Logo */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-gold/20 safe-area-inset-top">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            {/* Coin Logo */}
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gold">
              <img src={coinMughalFront} alt="NSH" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif font-bold gold-text">Market</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-full hover:bg-muted/50"
            >
              <Search className="w-5 h-5" />
            </button>
            <CartDrawer />
          </div>
        </div>
      </header>

      {/* Category Toggle & Stats */}
      <section className="sticky top-14 z-30 bg-background/95 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              showCategories ? "bg-gold text-background" : "bg-secondary text-secondary-foreground"
            )}
          >
            <Grid className="w-4 h-4" />
            Categories
          </button>
          <span className="text-sm text-muted-foreground">
            <strong className="text-foreground">{listings.length}</strong> coins
          </span>
        </div>
      </section>

      {/* Category Grid */}
      <AnimatePresence>
        {showCategories && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-card/50 border-b border-border/40"
          >
            <CategoryGrid4x4
              categories={categories.map(c => ({
                id: c.id,
                slug: c.id, // Using ID as slug for simplification in DB mode
                title: c.name || c.title
              }))}
              activeCategory={activeCategory}
              onCategorySelect={handleCategorySelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <section className="px-4 py-3 flex items-center justify-between border-b border-border/40">
        <button
          onClick={() => setShowSort(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-sm"
        >
          {sortOptions.find(s => s.id === sortBy)?.label}
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold/10 text-gold text-sm font-medium border border-gold/30"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </section>

      {/* Coins Grid */}
      <main className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No coins found matching your criteria.</p>
            <Button variant="link" onClick={() => { setActiveCategory('all'); setPriceRange([0, 500000]); setSearchQuery(""); }} className="mt-2 text-gold">
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MarketplaceCoinCard
                  id={listing.id}
                  title={listing.title}
                  era={listing.year ? listing.year.toString() : ""}
                  price={listing.price}
                  // Extract first image from relation
                  images={listing.coin_images?.map((img: any) => img.url) || []}
                  isWishlisted={wishlist.includes(listing.id)}
                  onWishlistToggle={() => toggleWishlist(listing.id)}
                  onAddToCart={() => handleAddToCart(listing)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="mt-6 text-center">
          <Button variant="outline" className="rounded-xl border-gold/40 text-gold hover:bg-gold/10">
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
                    className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button onClick={() => setShowSearch(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="px-4 py-4">
                <h3 className="text-sm font-semibold mb-3">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {["Mughal Gold", "Victoria Rupee", "Ancient Coins", "Shah Jahan"].map(term => (
                    <button key={term} className="px-3 py-1.5 rounded-full bg-secondary text-sm">
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 border-t border-border/40">
                <h3 className="text-sm font-semibold mb-3">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 8).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.slug);
                        setShowSearch(false);
                      }}
                      className="px-3 py-1.5 rounded-full bg-gold/10 text-gold text-sm border border-gold/20"
                    >
                      {cat.title}
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
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowSort(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 safe-area-inset-bottom border-t border-gold/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
              <h3 className="font-serif font-semibold text-lg mb-4">Sort By</h3>
              <div className="space-y-2">
                {sortOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSort(false);
                    }}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-colors",
                      sortBy === option.id ? "bg-gold text-background font-medium" : "hover:bg-secondary"
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
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto safe-area-inset-bottom border-t border-gold/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif font-semibold text-lg">Filters</h3>
                <button className="text-sm text-gold">Clear All</button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 500000]}
                    max={500000}
                    step={5000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Metal */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Metal</h4>
                <div className="flex flex-wrap gap-2">
                  {metalOptions.map(metal => (
                    <button
                      key={metal}
                      onClick={() => setSelectedMetals(prev =>
                        prev.includes(metal) ? prev.filter(m => m !== metal) : [...prev, metal]
                      )}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm border transition-all",
                        selectedMetals.includes(metal)
                          ? "bg-gold text-background border-gold"
                          : "bg-secondary border-border"
                      )}
                    >
                      {metal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rarity */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Rarity</h4>
                <div className="flex flex-wrap gap-2">
                  {rarityOptions.map(rarity => (
                    <button
                      key={rarity}
                      onClick={() => setSelectedRarity(prev =>
                        prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
                      )}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm border transition-all",
                        selectedRarity.includes(rarity)
                          ? "bg-gold text-background border-gold"
                          : "bg-secondary border-border"
                      )}
                    >
                      {rarity}
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

      <PremiumNavBar />
    </div>
  );
}
