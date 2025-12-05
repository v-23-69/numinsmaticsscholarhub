import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Shield, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedPostCardProps {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  images: string[];
  content: string;
  coinId?: string;
  coinTitle?: string;
  coinPrice?: number;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  timeAgo: string;
}

export function FeedPostCard({
  id,
  user,
  images,
  content,
  coinId,
  coinTitle,
  coinPrice,
  likeCount,
  commentCount,
  isLiked = false,
  isSaved = false,
  timeAgo,
}: FeedPostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [currentImage, setCurrentImage] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <article className="border-b border-border/40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/user/${user.id}`} className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">{user.username}</span>
            {user.isVerified && (
              <Shield className="w-3.5 h-3.5 text-emerald fill-emerald/20" />
            )}
          </div>
        </Link>
        <button className="p-2 -mr-2 text-muted-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <img
          src={images[currentImage]}
          alt="Post"
          className="w-full h-full object-cover"
        />
        
        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  i === currentImage ? "bg-primary-foreground" : "bg-primary-foreground/40"
                )}
              />
            ))}
          </div>
        )}

        {/* Coin tag overlay */}
        {coinId && (
          <Link
            to={`/marketplace/coin/${coinId}`}
            className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-charcoal/80 backdrop-blur-sm text-primary-foreground"
          >
            <Tag className="w-4 h-4" />
            <div className="text-left">
              <p className="text-xs font-medium line-clamp-1">{coinTitle}</p>
              {coinPrice && (
                <p className="text-xs text-gold font-semibold">{formatPrice(coinPrice)}</p>
              )}
            </div>
          </Link>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 1.2 }}
            onClick={() => setLiked(!liked)}
            className="p-1"
          >
            <Heart
              className={cn(
                "w-6 h-6 transition-colors",
                liked ? "text-destructive fill-destructive" : "text-foreground"
              )}
            />
          </motion.button>
          <button className="p-1">
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="p-1">
            <Send className="w-6 h-6" />
          </button>
        </div>
        <motion.button
          whileTap={{ scale: 1.1 }}
          onClick={() => setSaved(!saved)}
          className="p-1"
        >
          <Bookmark
            className={cn(
              "w-6 h-6 transition-colors",
              saved ? "text-foreground fill-foreground" : "text-foreground"
            )}
          />
        </motion.button>
      </div>

      {/* Likes & Content */}
      <div className="px-4 pb-3 space-y-1.5">
        <p className="text-sm font-semibold">{likeCount + (liked ? 1 : 0)} likes</p>
        <p className="text-sm">
          <Link to={`/user/${user.id}`} className="font-semibold mr-1.5">
            {user.username}
          </Link>
          {content}
        </p>
        {commentCount > 0 && (
          <Link to={`/post/${id}`} className="text-sm text-muted-foreground">
            View all {commentCount} comments
          </Link>
        )}
        <p className="text-xs text-muted-foreground uppercase">{timeAgo}</p>
      </div>
    </article>
  );
}
