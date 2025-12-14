import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/marketplace", icon: ShoppingBag, label: "Market" },
  { href: "/authenticate", icon: Shield, label: "Verify" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function PremiumNavBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-card/95 via-[hsl(var(--blue-light)/0.95)] to-card/95 backdrop-blur-xl border-t-2 border-gold/40 safe-area-inset-bottom shadow-[0_-4px_20px_hsl(var(--gold)/0.1)]">
      {/* Gold line on top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent shadow-[0_0_8px_hsl(var(--gold)/0.3)]" />
      
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  layoutId="navIndicatorLine"
                  className="absolute top-0 w-8 h-0.5 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(var(--gold)), hsl(var(--gold-light)))",
                    boxShadow: "0 0 12px hsl(var(--gold) / 0.6)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isActive ? "text-gold" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      "w-5 h-5 transition-all",
                      isActive && "drop-shadow-[0_0_8px_hsl(var(--gold)/0.5)]"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive && "text-gold"
                )}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
