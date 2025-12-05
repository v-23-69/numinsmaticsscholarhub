import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Bell, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MobileHeaderProps {
  showSearch?: boolean;
  title?: string;
  onSearchClick?: () => void;
}

export function MobileHeader({ showSearch = true, title, onSearchClick }: MobileHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/40 safe-area-inset-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo / Title */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <span className="text-charcoal font-serif font-bold text-base">N</span>
          </div>
          {title ? (
            <span className="font-serif font-semibold text-lg">{title}</span>
          ) : (
            <span className="font-serif font-semibold text-lg tracking-tight">NSH</span>
          )}
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {showSearch && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onSearchClick}
              className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <Search className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
          </motion.button>
          {user ? (
            <Link to="/profile">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden"
              >
                <User className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </Link>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full"
            >
              Sign In
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
