import { motion } from "framer-motion";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileNavBar } from "@/components/mobile/MobileNavBar";
import { MobileStoriesStrip } from "@/components/mobile/MobileStoriesStrip";
import { QuickActionsBar } from "@/components/mobile/QuickActionsBar";
import { FeedPostCard } from "@/components/mobile/FeedPostCard";
import { TrustBadge } from "@/components/mobile/TrustBadge";
import coinMughalFront from "@/assets/coin-mughal-front.jpg";
import coinBritishFront from "@/assets/coin-british-front.jpg";
import coinSultanateFront from "@/assets/coin-sultanate-front.jpg";
import coinAncientFront from "@/assets/coin-ancient-front.jpg";

const mockPosts = [
  {
    id: "1",
    user: {
      id: "u1",
      username: "heritage_coins",
      avatar: "https://i.pravatar.cc/150?img=10",
      isVerified: true,
    },
    images: [coinMughalFront, coinBritishFront],
    content: "Just acquired this stunning Shah Jahan Gold Mohur from 1628. The calligraphy detail is exceptional! 🪙✨ #MughalCoins #Numismatics",
    coinId: "1",
    coinTitle: "Shah Jahan Gold Mohur",
    coinPrice: 285000,
    likeCount: 234,
    commentCount: 18,
    timeAgo: "2 hours ago",
  },
  {
    id: "2",
    user: {
      id: "u2",
      username: "coin_expert_raj",
      avatar: "https://i.pravatar.cc/150?img=12",
      isVerified: true,
    },
    images: [coinBritishFront],
    content: "Pro tip: When examining Victoria-era coins, always check the edge lettering. It's one of the key authenticity markers. 📚",
    likeCount: 456,
    commentCount: 42,
    timeAgo: "4 hours ago",
  },
  {
    id: "3",
    user: {
      id: "u3",
      username: "ancient_treasures",
      avatar: "https://i.pravatar.cc/150?img=15",
      isVerified: false,
    },
    images: [coinAncientFront, coinSultanateFront],
    content: "New arrival! Gupta Dynasty gold dinar, 4th century AD. The archer king depiction is beautifully preserved. DM for details.",
    coinId: "4",
    coinTitle: "Gupta Dynasty Gold Dinar",
    coinPrice: 450000,
    likeCount: 567,
    commentCount: 89,
    timeAgo: "6 hours ago",
  },
  {
    id: "4",
    user: {
      id: "u4",
      username: "delhi_sultanate",
      avatar: "https://i.pravatar.cc/150?img=20",
      isVerified: true,
    },
    images: [coinSultanateFront],
    content: "Rare find! Delhi Sultanate silver tanka with crisp Arabic inscription. These medieval treasures tell stories of empire. 🏰",
    coinId: "3",
    coinTitle: "Delhi Sultanate Silver Tanka",
    coinPrice: 78000,
    likeCount: 189,
    commentCount: 24,
    timeAgo: "8 hours ago",
  },
];

export default function MobileHome() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader />
      
      <main>
        {/* Stories */}
        <MobileStoriesStrip />
        
        {/* Quick Actions */}
        <QuickActionsBar />
        
        {/* Trust Badge */}
        <TrustBadge />
        
        {/* Feed */}
        <section className="divide-y divide-border/40">
          {mockPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FeedPostCard {...post} />
            </motion.div>
          ))}
        </section>
        
        {/* Load more indicator */}
        <div className="py-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            Loading more...
          </div>
        </div>
      </main>
      
      <MobileNavBar />
    </div>
  );
}
