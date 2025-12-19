import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PremiumHeader } from "@/components/mobile/PremiumHeader";
import { PremiumNavBar } from "@/components/mobile/PremiumNavBar";
import { AdminStoriesStrip } from "@/components/mobile/AdminStoriesStrip";
import { FeedShowcaseCard, FeedCompactCard } from "@/components/mobile/FeedShowcaseCard";
import { homeFeedItems } from "@/data/nshMockData";
import { Sparkles, TrendingUp, Shield, Award, ArrowRight, Zap, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MobileHome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/welcome');
    }
  }, [user, loading, navigate]);

  const fetchFeedItems = async (append = false) => {
    try {
      // Fetch from database
      const { data, error } = await supabase
        .from('home_feed_items')
        .select('*')
        .eq('is_visible', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching feed:', error);
        // Fallback to mock data if database fails
        if (!append) {
          setFeedItems(homeFeedItems);
        }
        return;
      }

      if (data && data.length > 0) {
        // Transform database items to match FeedCard format
        const transformed = data.map((item: any) => ({
          id: item.id,
          type: item.type === 'featured_coin' ? 'featured' : 
                item.type === 'expert_promo' ? 'promotion' :
                item.type === 'seasonal_offer' ? 'promotion' :
                item.type === 'educational' ? 'education' : 'featured',
          title: item.title,
          description: item.subtitle || '',
          image: item.image_url || '',
          coinId: item.reference_id || null,
          ctaLabel: "View Details",
          ctaLink: item.reference_id ? `/coin/${item.reference_id}` : null,
        }));

        if (append) {
          setFeedItems(prev => [...prev, ...transformed]);
        } else {
          setFeedItems(transformed);
        }
        setHasMore(data.length >= 20);
      } else {
        // No items in database, use mock data
        if (!append) {
          setFeedItems(homeFeedItems);
        }
      }
    } catch (error) {
      console.error('Error fetching feed items:', error);
      if (!append) {
        setFeedItems(homeFeedItems);
      }
    } finally {
      setFeedLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFeedItems();
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeedItems();
    toast.success("Feed updated");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(var(--blue-light))] to-background pb-20 relative overflow-hidden">
      {/* Premium Background Pattern - Theme Aware */}
      <div className="fixed inset-0 opacity-[0.02] dark:opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--gold)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue/10 via-transparent to-gold/5 pointer-events-none" />

      <PremiumHeader onRefresh={handleRefresh} refreshing={refreshing} />
      
      <main className="relative z-10">
        {/* Admin-Only Stories Strip */}
        <AdminStoriesStrip />
        
        {/* Premium Hero Stats Section */}
        <section className="px-4 py-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
          >
            <QuickStatBadge
              icon={<TrendingUp className="w-4 h-4" />}
              label="15,240"
              sublabel="Coins Listed"
              gradient="from-amber-600 to-amber-500"
            />
            <QuickStatBadge
              icon={<Shield className="w-4 h-4" />}
              label="2,340"
              sublabel="Verified Sellers"
              gradient="from-emerald-600 to-emerald-500"
            />
            <QuickStatBadge
              icon={<Award className="w-4 h-4" />}
              label="98%"
              sublabel="Auth Accuracy"
              gradient="from-gold to-gold-light"
            />
          </motion.div>
        </section>

        {/* Premium Divider with Glow */}
        <div className="relative px-4 py-2">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent shadow-[0_0_8px_hsl(var(--gold)/0.3)]" />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-gold/30 blur-sm" />
        </div>

        {/* Welcome Section - Premium Design */}
        <section className="px-4 py-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full" />
                <Sparkles className="w-6 h-6 text-gold relative z-10" />
              </div>
              <h2 className="font-serif text-2xl font-bold bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                Curated For You
              </h2>
            </div>
            <p className="text-sm text-muted-foreground ml-9 leading-relaxed">
              Featured coins, expert insights & exclusive offers
            </p>
          </motion.div>
        </section>

        {/* Feed - Curated Cards with Premium Spacing */}
        <section ref={feedContainerRef} className="space-y-3 px-4">
          {feedLoading && feedItems.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : feedItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Sparkles className="w-16 h-16 text-gold/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No feed items yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Check back later for updates</p>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </motion.div>
          ) : (
            <>
              {feedItems.map((item, index) => {
                // Alternate between showcase and compact cards
                if (index % 3 === 0 || item.type === "featured" || item.type === "auction") {
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <FeedShowcaseCard {...item} />
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <FeedCompactCard {...item} />
                  </motion.div>
                );
              })}
              
              {/* Pull to Refresh Indicator */}
              {refreshing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-4"
                >
                  <RefreshCw className="w-5 h-5 animate-spin text-gold mr-2" />
                  <span className="text-sm text-muted-foreground">Refreshing...</span>
                </motion.div>
              )}

              {/* Load More Button */}
              {hasMore && !feedLoading && (
                <div className="py-8 px-4 text-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fetchFeedItems(true)}
                    disabled={feedLoading}
                    className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-gold/50 bg-gradient-to-r from-gold/10 via-gold/15 to-gold/10 backdrop-blur-sm text-gold text-sm font-semibold overflow-hidden transition-all hover:border-gold/70 hover:shadow-[0_0_25px_hsl(var(--gold)/0.4)] hover:from-gold/15 hover:via-gold/20 hover:to-gold/15 disabled:opacity-50"
                  >
                    {feedLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">Load More</span>
                        <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      
      <PremiumNavBar />
    </div>
  );
}

function QuickStatBadge({ 
  icon, 
  label, 
  sublabel,
  gradient = "from-gold to-gold-light"
}: { 
  icon: React.ReactNode; 
  label: string; 
  sublabel: string;
  gradient?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="shrink-0 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/30 backdrop-blur-sm shadow-lg hover:shadow-[0_8px_32px_hsl(var(--gold)/0.25)] hover:border-gold/50 transition-all group"
    >
      <div className={cn(
        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-gold shadow-lg group-hover:shadow-gold/30 transition-shadow",
        `bg-gradient-to-br ${gradient}`
      )}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <div>
        <p className="font-bold text-base text-foreground leading-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{sublabel}</p>
      </div>
    </motion.div>
  );
}
