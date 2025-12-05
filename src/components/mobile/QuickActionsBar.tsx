import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Upload, Video, TrendingUp } from "lucide-react";

const actions = [
  {
    icon: Shield,
    label: "Authenticate",
    href: "/authenticate",
    color: "bg-emerald/10 text-emerald",
  },
  {
    icon: Upload,
    label: "Sell Coin",
    href: "/sell",
    color: "bg-gold/10 text-gold-dark",
  },
  {
    icon: TrendingUp,
    label: "Marketplace",
    href: "/marketplace",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Video,
    label: "Webinars",
    href: "/events",
    color: "bg-stone/20 text-charcoal",
  },
];

export function QuickActionsBar() {
  return (
    <section className="px-4 py-4 border-b border-border/40">
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={action.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:bg-secondary/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
