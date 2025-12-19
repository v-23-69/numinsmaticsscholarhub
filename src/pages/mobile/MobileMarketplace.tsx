import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown, Grid, Loader2, Sparkles, TrendingUp } from "lucide-react";
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
          let filtered = listingData;

          // Price Range
          filtered = filtered.filter(l => l.price >= priceRange[0] && l.price <= priceRange[1]);

          // Metals
          if (selectedMetals.length > 0) {
            filtered = filtered.filter(l => l.metal && selectedMetals.includes(l.metal));
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
  }, [activeCategory, sortBy, priceRange, selectedMetals, searchQuery]);

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
    const mainImage = listing.coin_images?.[0]?.url || "";

    // If it's a Shopify product, use Shopify IDs; otherwise use listing IDs
    const productId = listing.is_shopify_product && listing.shopify_product_id 
      ? listing.shopify_product_id 
      : listing.id;
    const variantId = listing.is_shopify_product && listing.shopify_variant_id
      ? listing.shopify_variant_id
      : listing.id;

    addItem({
      product: {
        node: {
          id: productId,
          title: listing.title,
          description: listing.description || "",
          handle: listing.shopify_handle || listing.id,
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
      variantId: variantId,
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
    <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(var(--blue-light))] to-background pb-20 relative overflow-hidden">
      {/* Premium Background Pattern - Theme Aware */}
      <div className="fixed inset-0 opacity-[0.02] dark:opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--gold)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue/10 via-transparent to-gold/5 pointer-events-none" />

      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-card/95 via-[hsl(var(--blue-light)/0.95)] to-card/95 backdrop-blur-2xl border-b-2 border-gold/30 safe-area-inset-top shadow-2xl">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent shadow-[0_0_8px_hsl(var(--gold)/0.3)]" />
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full" />
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold/40 shadow-lg relative z-10">
                <img src={coinMughalFront} alt="NSH" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <span className="font-serif font-bold text-lg bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent block">
                Market
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Premium Coins</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(true)}
              className="p-2.5 rounded-xl hover:bg-blue/30 transition-colors"
            >
              <Search className="w-5 h-5 text-foreground" />
            </motion.button>
            <CartDrawer />
          </div>
        </div>
      </header>

      {/* Premium Category Toggle & Stats */}
      <section className="sticky top-16 z-30 bg-gradient-to-b from-card/95 via-[hsl(var(--blue-light)/0.95)] to-transparent backdrop-blur-xl border-b border-gold/20">
        <div className="flex items-center justify-between px-4 py-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCategories(!showCategories)}
            className={cn(
              "flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-lg",
              showCategories 
                ? "bg-gradient-to-r from-gold via-gold-light to-gold text-black shadow-[0_8px_32px_rgba(96,165,250,0.4)]" 
                : "bg-gradient-to-br from-blue/20 via-blue/15 to-blue/20 border border-gold/30 text-foreground hover:border-gold/50"
            )}
          >
            <Grid className="w-4 h-4" />
            Categories
          </motion.button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-br from-blue/25 via-blue/20 to-blue/25 border border-gold/20">
            <TrendingUp className="w-4 h-4 text-gold" />
            <span className="text-sm font-bold text-foreground">
              <span className="text-gold">{listings.length}</span> coins
            </span>
          </div>
        </div>
      </section>

      {/* Premium Category Grid */}
      <AnimatePresence>
        {showCategories && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-muted/30 border-b border-gold/20"
          >
            <CategoryGrid4x4
              categories={categories.map(c => ({
                id: c.id,
                slug: c.id,
                title: c.name || c.title
              }))}
              activeCategory={activeCategory}
              onCategorySelect={handleCategorySelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Toolbar */}
      <section className="px-4 py-4 flex items-center justify-between border-b border-gold/20">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSort(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/30 text-sm font-medium text-foreground hover:border-gold/50 hover:shadow-lg transition-all"
        >
          {sortOptions.find(s => s.id === sortBy)?.label}
          <ChevronDown className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-gold/20 via-gold/15 to-gold/20 border-2 border-gold/30 text-gold text-sm font-semibold hover:border-gold/50 hover:shadow-[0_0_20px_rgba(96,165,250,0.2)] transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </motion.button>
      </section>

      {/* Premium Coins Grid */}
      <main className="px-4 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gold mb-4" />
            <p className="text-muted-foreground">Loading premium coins...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-card border-2 border-gold/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gold/60" />
            </div>
            <p className="text-foreground font-medium mb-2">No coins found</p>
            <p className="text-sm text-muted-foreground mb-6">Try adjusting your filters</p>
            <Button 
              variant="outline" 
              onClick={() => { 
                setActiveCategory('all'); 
                setPriceRange([0, 500000]); 
                setSearchQuery(""); 
                setSelectedMetals([]);
                setSelectedRarity([]);
              }} 
              className="rounded-2xl border-gold/40 text-gold hover:bg-gold/10 h-12 px-6"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <MarketplaceCoinCard
                  id={listing.id}
                  title={listing.title}
                  era={listing.year ? listing.year.toString() : ""}
                  price={listing.price}
                  images={listing.coin_images?.map((img: any) => img.url) || []}
                  isWishlisted={wishlist.includes(listing.id)}
                  onWishlistToggle={() => toggleWishlist(listing.id)}
                  onAddToCart={() => handleAddToCart(listing)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Premium Load More */}
        {listings.length > 0 && (
          <div className="mt-8 text-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-gold/40 bg-gradient-to-r from-blue/15 via-blue/10 to-blue/15 backdrop-blur-sm text-gold text-sm font-semibold hover:border-gold/60 hover:shadow-[0_0_20px_hsl(var(--gold)/0.3)] transition-all"
            >
              Load More
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </main>

      {/* Premium Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md"
          >
            <div className="safe-area-inset-top">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gold/20 bg-gradient-to-b from-card via-[hsl(var(--blue-light))] to-card">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                  <input
                    type="text"
                    placeholder="Search coins, sellers, eras..."
                    className="w-full pl-12 pr-4 py-3.5 bg-gradient-to-br from-blue/20 via-blue/15 to-blue/20 border-2 border-gold/20 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/40 transition-all"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <motion.button 
                  onClick={() => setShowSearch(false)}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl hover:bg-blue/30 transition-colors"
                >
                  <X className="w-6 h-6 text-foreground" />
                </motion.button>
              </div>

              <div className="px-4 py-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    Recent Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["Mughal Gold", "Victoria Rupee", "Ancient Coins", "Shah Jahan"].map(term => (
                      <motion.button
                        key={term}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSearchQuery(term);
                          setShowSearch(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-card border border-gold/20 text-sm text-foreground hover:border-gold/40 transition-all"
                      >
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gold/20 pt-6">
                  <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gold" />
                    Popular Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 8).map(cat => (
                      <motion.button
                        key={cat.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setActiveCategory(cat.slug || cat.id);
                          setShowSearch(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold/20 via-gold/15 to-gold/20 border border-gold/30 text-gold text-sm font-medium hover:border-gold/50 hover:shadow-[0_0_15px_rgba(96,165,250,0.2)] transition-all"
                      >
                        {cat.title || cat.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Sort Bottom Sheet */}
      <AnimatePresence>
        {showSort && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            onClick={() => setShowSort(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-card via-[hsl(var(--blue-light))] to-card rounded-t-3xl p-6 safe-area-inset-bottom border-t-2 border-gold/30 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-6">
                <div className="w-12 h-1 rounded-full bg-gold/40" />
              </div>
              <h3 className="font-serif font-bold text-xl mb-6 text-center text-foreground">Sort By</h3>
              <div className="space-y-2">
                {sortOptions.map(option => (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSort(false);
                    }}
                    className={cn(
                      "w-full p-4 rounded-2xl text-left transition-all font-medium",
                      sortBy === option.id 
                        ? "bg-gradient-to-r from-gold via-gold-light to-gold text-primary-foreground shadow-[0_8px_32px_hsl(var(--gold)/0.4)]" 
                        : "bg-card border border-gold/20 text-foreground hover:border-gold/40"
                    )}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Filters Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto safe-area-inset-bottom border-t-2 border-gold/30 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-6">
                <div className="w-12 h-1 rounded-full bg-gold/40" />
              </div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif font-bold text-xl text-foreground">Filters</h3>
                <button 
                  onClick={() => {
                    setPriceRange([0, 500000]);
                    setSelectedMetals([]);
                    setSelectedRarity([]);
                  }}
                  className="text-sm text-gold font-semibold hover:text-gold-light transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-muted via-[hsl(var(--blue))] to-muted border-2 border-gold/30">
                <h4 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold" />
                  Price Range
                </h4>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 500000]}
                    max={500000}
                    step={5000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-gold font-semibold">₹{priceRange[0].toLocaleString()}</span>
                    <span className="text-gold font-semibold">₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Metal */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-foreground">Metal Type</h4>
                <div className="flex flex-wrap gap-2">
                  {metalOptions.map(metal => (
                    <motion.button
                      key={metal}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMetals(prev =>
                        prev.includes(metal) ? prev.filter(m => m !== metal) : [...prev, metal]
                      )}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all",
                        selectedMetals.includes(metal)
                          ? "bg-gradient-to-r from-gold via-gold-light to-gold text-primary-foreground border-gold shadow-[0_4px_16px_hsl(var(--gold)/0.3)]"
                          : "bg-card border-gold/20 text-foreground hover:border-gold/40"
                      )}
                    >
                      {metal}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Rarity */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-foreground">Rarity</h4>
                <div className="flex flex-wrap gap-2">
                  {rarityOptions.map(rarity => (
                    <motion.button
                      key={rarity}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedRarity(prev =>
                        prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
                      )}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all",
                        selectedRarity.includes(rarity)
                          ? "bg-gradient-to-r from-gold via-gold-light to-gold text-primary-foreground border-gold shadow-[0_4px_16px_hsl(var(--gold)/0.3)]"
                          : "bg-card border-gold/20 text-foreground hover:border-gold/40"
                      )}
                    >
                      {rarity}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <Button
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-primary-foreground font-bold text-base shadow-[0_8px_32px_hsl(var(--gold)/0.4)] hover:shadow-[0_12px_40px_hsl(var(--gold)/0.5)]"
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
