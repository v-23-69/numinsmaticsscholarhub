import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Search, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumHeaderProps {
  title?: string;
  showSearch?: boolean;
  showCart?: boolean;
  showNotifications?: boolean;
  transparent?: boolean;
  onSearchClick?: () => void;
}

export function PremiumHeader({
  title = "NSH",
  showSearch = true,
  showCart = false,
  showNotifications = true,
  transparent = false,
  onSearchClick,
}: PremiumHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 safe-area-inset-top transition-colors",
        transparent
          ? "bg-transparent"
          : "bg-gradient-to-b from-card/95 via-[hsl(var(--blue-light)/0.95)] to-card/95 backdrop-blur-xl border-b-2 border-gold/30"
      )}
    >
      {/* Bottom gold accent line */}
      {!transparent && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent shadow-[0_0_8px_hsl(var(--gold)/0.3)]" />
      )}

      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo / Title */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Logo Mark */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <span className="text-sm font-serif font-bold text-primary-foreground">N</span>
            </div>
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 rounded-lg overflow-hidden"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.div>
          </motion.div>
          
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg leading-tight gold-text">
              {title}
            </span>
            <span className="text-[9px] text-muted-foreground tracking-wider uppercase">
              Scholar Hub
            </span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {showSearch && (
            <button
              onClick={onSearchClick}
              className="p-2.5 rounded-full hover:bg-muted/50 transition-colors"
            >
              <Search className="w-5 h-5 text-foreground" />
            </button>
          )}

          {showCart && (
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full hover:bg-muted/50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                2
              </span>
            </Link>
          )}

          {showNotifications && (
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-full hover:bg-muted/50 transition-colors"
            >
              <Bell className="w-5 h-5 text-foreground" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold"
              />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
