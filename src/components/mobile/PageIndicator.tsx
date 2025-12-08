import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const PAGES = [
  { path: "/", label: "Home" },
  { path: "/marketplace", label: "Market" },
  { path: "/authenticate", label: "Auth" },
  { path: "/profile", label: "Profile" },
];

export function PageIndicator() {
  const location = useLocation();
  const currentIndex = PAGES.findIndex(p => p.path === location.pathname);

  if (currentIndex === -1) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/40">
      {PAGES.map((page, index) => (
        <motion.div
          key={page.path}
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-colors",
            index === currentIndex ? "bg-gold" : "bg-muted-foreground/30"
          )}
          animate={{
            scale: index === currentIndex ? 1.2 : 1,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      ))}
    </div>
  );
}
