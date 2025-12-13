import { motion } from "framer-motion";
import { Plus, Play, Sparkles } from "lucide-react";
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
  const getStoryShape = (story: Story): "circle" | "hexagon" | "rectangle" => {
    if (story.type === "expert" || story.type === "auction") return "hexagon";
    if (story.type === "event") return "rectangle";
    return "circle";
  };

  return (
    <section className="py-4 border-b border-gold/10">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-elegant px-4 pb-2 hide-scrollbar">
        {/* Add Story */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center gap-2 shrink-0"
        >
          <div className="relative">
            <div className="w-[72px] h-[72px] rounded-2xl bg-secondary border-2 border-dashed border-gold/30 flex items-center justify-center transition-all hover:border-gold/50">
              <Plus className="w-7 h-7 text-gold" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">Your Story</span>
        </motion.button>

        {/* Stories */}
        {mockStories.map((story, index) => {
          const shape = getStoryShape(story);
          const isPremium = story.type === "expert" || story.type === "auction" || story.type === "event";
          
          return (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <div className="relative">
                {shape === "hexagon" ? (
                  <div className={cn(
                    "story-hexagon",
                    story.isViewed && "opacity-60"
                  )}>
                    <div className="w-full h-full bg-background flex items-center justify-center" style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)" }}>
                      <img
                        src={story.avatar}
                        alt={story.username}
                        className="w-full h-full object-cover"
                        style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)" }}
                      />
                    </div>
                  </div>
                ) : shape === "rectangle" ? (
                  <div className={cn(
                    "story-rectangle w-[72px] h-[72px]",
                    story.isViewed && "opacity-60"
                  )}>
                    <div className="w-full h-full rounded-2xl bg-background overflow-hidden">
                      <img
                        src={story.avatar}
                        alt={story.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    story.isViewed ? "story-ring-inactive" : "story-ring",
                    "w-[72px] h-[72px]"
                  )}>
                    <div className="w-full h-full rounded-full bg-background overflow-hidden">
                      <img
                        src={story.avatar}
                        alt={story.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Live Badge */}
                {story.isLive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-bold uppercase bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center gap-1 shadow-lg shadow-red-500/50">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                    Live
                  </motion.span>
                )}
                
                {/* Expert Badge */}
                {story.type === "expert" && !story.isLive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-semibold bg-gradient-to-r from-gold to-gold-light text-background rounded-full flex items-center gap-1 shadow-lg shadow-gold/50">
                    <Sparkles className="w-2.5 h-2.5" />
                    Expert
                  </span>
                )}
                
                {/* Premium Glow for Special Types */}
                {isPremium && !story.isViewed && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full bg-gold/20 blur-xl -z-10"
                  />
                )}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[72px]">
                {story.username}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
