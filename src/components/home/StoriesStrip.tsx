import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  username: string;
  avatar: string;
  isViewed: boolean;
  isLive?: boolean;
}

const mockStories: Story[] = [
  { id: "1", username: "MughalCollector", avatar: "https://i.pravatar.cc/150?img=1", isViewed: false, isLive: true },
  { id: "2", username: "CoinExpert", avatar: "https://i.pravatar.cc/150?img=2", isViewed: false },
  { id: "3", username: "RareFinds", avatar: "https://i.pravatar.cc/150?img=3", isViewed: false },
  { id: "4", username: "VintageCoins", avatar: "https://i.pravatar.cc/150?img=4", isViewed: true },
  { id: "5", username: "NumisVault", avatar: "https://i.pravatar.cc/150?img=5", isViewed: true },
  { id: "6", username: "CoinHunter", avatar: "https://i.pravatar.cc/150?img=6", isViewed: false },
  { id: "7", username: "HistoryInHand", avatar: "https://i.pravatar.cc/150?img=7", isViewed: true },
  { id: "8", username: "GoldStandard", avatar: "https://i.pravatar.cc/150?img=8", isViewed: false },
];

export function StoriesStrip() {
  return (
    <section className="py-6 md:py-8 border-b border-border/60">
      <div className="container">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-elegant pb-2 -mx-1.5 px-1.5">
          {/* Add Story */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 shrink-0"
          >
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">Add Story</span>
          </motion.button>

          {/* Stories */}
          {mockStories.map((story, index) => (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <div className="relative">
                <div
                  className={cn(
                    "p-0.5 rounded-full",
                    story.isViewed
                      ? "bg-stone/50"
                      : "bg-gradient-to-br from-gold via-accent to-gold-dark"
                  )}
                >
                  <div className="p-0.5 rounded-full bg-background">
                    <img
                      src={story.avatar}
                      alt={story.username}
                      className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-full object-cover"
                    />
                  </div>
                </div>
                {story.isLive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold uppercase bg-destructive text-destructive-foreground rounded-sm">
                    Live
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-muted-foreground truncate max-w-[72px]">
                {story.username}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
