import { motion } from "framer-motion";
import { PremiumHeader } from "@/components/mobile/PremiumHeader";
import { PremiumNavBar } from "@/components/mobile/PremiumNavBar";
import { AdminStoriesStrip } from "@/components/mobile/AdminStoriesStrip";
import { FeedShowcaseCard, FeedCompactCard } from "@/components/mobile/FeedShowcaseCard";
import { homeFeedItems } from "@/data/nshMockData";
import { Sparkles, TrendingUp, Shield, Award } from "lucide-react";

export default function MobileHome() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <PremiumHeader />
      
      <main>
        {/* Admin-Only Stories Strip */}
        <AdminStoriesStrip />
        
        {/* Quick Stats Banner */}
        <section className="px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-elegant pb-1">
            <QuickStatBadge
              icon={<TrendingUp className="w-4 h-4" />}
              label="15,240"
              sublabel="Coins Listed"
            />
            <QuickStatBadge
              icon={<Shield className="w-4 h-4" />}
              label="2,340"
              sublabel="Verified Sellers"
            />
            <QuickStatBadge
              icon={<Award className="w-4 h-4" />}
              label="98%"
              sublabel="Auth Accuracy"
            />
          </div>
        </section>

        {/* Divider */}
        <div className="divider-gold mx-4" />

        {/* Welcome Section */}
        <section className="px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-lg font-semibold">Curated For You</h2>
          </motion.div>
          <p className="text-sm text-muted-foreground mt-1">
            Featured coins, expert insights & exclusive offers
          </p>
        </section>

        {/* Feed - Curated Cards */}
        <section className="space-y-2">
          {homeFeedItems.map((item, index) => {
            // Alternate between showcase and compact cards
            if (index % 3 === 0 || item.type === "featured" || item.type === "auction") {
              return (
                <FeedShowcaseCard
                  key={item.id}
                  {...item}
                />
              );
            }
            return (
              <FeedCompactCard
                key={item.id}
                {...item}
              />
            );
          })}
        </section>

        {/* Load More */}
        <div className="py-8 text-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gold/40 text-gold text-sm font-medium"
          >
            Load More
          </motion.button>
        </div>
      </main>
      
      <PremiumNavBar />
    </div>
  );
}

function QuickStatBadge({ 
  icon, 
  label, 
  sublabel 
}: { 
  icon: React.ReactNode; 
  label: string; 
  sublabel: string; 
}) {
  return (
    <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border/60">
      <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
        {icon}
      </div>
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-[10px] text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  );
}
