import { motion } from "framer-motion";
import { Plus, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  username: string;
  avatar: string;
  isViewed: boolean;
  isLive?: boolean;
  type?: "user" | "expert" | "auction" | "event";
}

const mockStories: Story[] = [
  { id: "1", username: "MughalCoin", avatar: "https://i.pravatar.cc/150?img=1", isViewed: false, isLive: true, type: "expert" },
  { id: "2", username: "CoinExpert", avatar: "https://i.pravatar.cc/150?img=2", isViewed: false, type: "expert" },
  { id: "3", username: "RareFinds", avatar: "https://i.pravatar.cc/150?img=3", isViewed: false, type: "user" },
  { id: "4", username: "Auction", avatar: "https://i.pravatar.cc/150?img=4", isViewed: false, type: "auction" },
  { id: "5", username: "NumisVault", avatar: "https://i.pravatar.cc/150?img=5", isViewed: true, type: "user" },
  { id: "6", username: "Webinar", avatar: "https://i.pravatar.cc/150?img=6", isViewed: false, type: "event" },
  { id: "7", username: "HistoryCoin", avatar: "https://i.pravatar.cc/150?img=7", isViewed: true, type: "user" },
  { id: "8", username: "GoldStand", avatar: "https://i.pravatar.cc/150?img=8", isViewed: false, type: "user" },
];

export function MobileStoriesStrip() {
  return (
    <section className="py-3 border-b border-border/40">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-elegant px-4 pb-1">
        {/* Add Story */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-1.5 shrink-0"
        >
          <div className="relative">
            <div className="w-[68px] h-[68px] rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">Your Story</span>
        </motion.button>

        {/* Stories */}
        {mockStories.map((story, index) => (
          <motion.button
            key={story.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div className="relative">
              <div
                className={cn(
                  "p-[2.5px] rounded-full",
                  story.isViewed
                    ? "bg-stone/40"
                    : story.type === "auction"
                    ? "bg-gradient-to-br from-destructive via-accent to-gold"
                    : story.type === "event"
                    ? "bg-gradient-to-br from-emerald via-emerald-light to-gold"
                    : "bg-gradient-to-br from-gold via-accent to-gold-dark"
                )}
              >
                <div className="p-[2px] rounded-full bg-background">
                  <img
                    src={story.avatar}
                    alt={story.username}
                    className="w-[60px] h-[60px] rounded-full object-cover"
                  />
                </div>
              </div>
              {story.isLive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-destructive text-destructive-foreground rounded-sm flex items-center gap-0.5">
                  <Play className="w-2 h-2 fill-current" />
                  Live
                </span>
              )}
              {story.type === "expert" && !story.isLive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-semibold bg-emerald text-primary-foreground rounded-sm">
                  Expert
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[68px]">
              {story.username}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
