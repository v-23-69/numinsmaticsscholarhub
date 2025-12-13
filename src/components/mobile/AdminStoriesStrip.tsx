import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  title: string;
  thumbnail: string;
  type: "image" | "video" | "coin";
  coinId?: string;
  coinTitle?: string;
  coinPrice?: number;
  isViewed: boolean;
}

const mockStories: Story[] = [
  {
    id: "1",
    title: "New Arrivals",
    thumbnail: "https://images.unsplash.com/photo-1621264448270-9ef00e88a935?w=400",
    type: "image",
    isViewed: false,
  },
  {
    id: "2",
    title: "Featured Coin",
    thumbnail: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400",
    type: "coin",
    coinId: "featured-1",
    coinTitle: "Mughal Gold Mohur",
    coinPrice: 285000,
    isViewed: false,
  },
  {
    id: "3",
    title: "Expert Tip",
    thumbnail: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=400",
    type: "video",
    isViewed: true,
  },
  {
    id: "4",
    title: "Auction Live",
    thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400",
    type: "image",
    isViewed: true,
  },
];

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

function StoryViewer({ story, onClose, onNext, onPrev, hasNext, hasPrev }: StoryViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Museum-style frame */}
      <div className="absolute inset-4 border-2 border-gold/30 rounded-2xl pointer-events-none" />
      <div className="absolute inset-6 border border-gold/20 rounded-xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 safe-area-inset-top">
        <div className="flex items-center gap-3">
          <div className="story-ring w-10 h-10">
            <img
              src={story.thumbnail}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <p className="font-serif font-semibold text-sm">{story.title}</p>
            <p className="text-xs text-muted-foreground">NSH Official</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-muted/50">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 flex gap-1">
        <motion.div
          className="h-0.5 flex-1 rounded-full bg-gold"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, ease: "linear" }}
          style={{ transformOrigin: "left" }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 relative flex items-center justify-center p-8">
        <motion.img
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={story.thumbnail}
          alt=""
          className="max-w-full max-h-full rounded-xl object-contain shadow-xl"
        />

        {/* Video play overlay */}
        {story.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-gold/90 flex items-center justify-center"
            >
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </motion.button>
          </div>
        )}

        {/* Coin spotlight card */}
        {story.type === "coin" && story.coinTitle && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-8 left-8 right-8 p-4 rounded-xl bg-card/90 backdrop-blur-sm border border-gold/30"
          >
            <p className="font-serif font-semibold">{story.coinTitle}</p>
            <p className="text-lg font-bold text-gold mt-1">
              ₹{story.coinPrice?.toLocaleString()}
            </p>
            <button className="mt-3 flex items-center gap-2 text-sm text-gold">
              <ExternalLink className="w-4 h-4" />
              View Coin
            </button>
          </motion.div>
        )}

        {/* Navigation arrows */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-muted/50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-muted/50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function AdminStoriesStrip() {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
  };

  const handleClose = () => setSelectedStoryIndex(null);
  const handleNext = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < mockStories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
    } else {
      setSelectedStoryIndex(null);
    }
  };
  const handlePrev = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    }
  };

  return (
    <>
      <section className="px-4 py-4 border-b border-border/40">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-elegant">
          {/* NSH Official story indicator */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative">
              <div className="story-ring w-16 h-16">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                  <span className="text-xl font-serif font-bold text-primary-foreground">N</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Official</span>
          </div>

          {/* Story items */}
          {mockStories.map((story, index) => (
            <motion.button
              key={story.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStoryClick(index)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div
                className={cn(
                  "relative w-16 h-16 rounded-full",
                  story.isViewed ? "story-ring-inactive" : "story-ring"
                )}
              >
                <img
                  src={story.thumbnail}
                  alt={story.title}
                  className="w-full h-full rounded-full object-cover"
                />
                {story.type === "video" && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 text-primary-foreground ml-0.5" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[64px]">
                {story.title}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {selectedStoryIndex !== null && (
          <StoryViewer
            story={mockStories[selectedStoryIndex]}
            onClose={handleClose}
            onNext={handleNext}
            onPrev={handlePrev}
            hasNext={selectedStoryIndex < mockStories.length - 1}
            hasPrev={selectedStoryIndex > 0}
          />
        )}
      </AnimatePresence>
    </>
  );
}
