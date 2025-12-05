import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Shield, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/marketplace", icon: ShoppingBag, label: "Shop" },
  { href: "/authenticate", icon: Shield, label: "Verify" },
  { href: "/messages", icon: MessageCircle, label: "Chat" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function MobileNavBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/60 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/" && location.pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
