import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Upload, Video, TrendingUp } from "lucide-react";

const actions = [
  {
    icon: Shield,
    title: "Authenticate",
    description: "Get expert verification for your coins with our trusted authentication service.",
    href: "/authenticate",
    color: "bg-emerald/10 text-emerald",
    accent: "group-hover:bg-emerald/15",
  },
  {
    icon: Upload,
    title: "Sell Your Coins",
    description: "List your collection and reach thousands of serious collectors instantly.",
    href: "/sell",
    color: "bg-gold/10 text-gold-dark",
    accent: "group-hover:bg-gold/15",
  },
  {
    icon: Video,
    title: "Join Webinar",
    description: "Learn from numismatic experts. Weekly grading workshops & market insights.",
    href: "/events",
    color: "bg-accent/10 text-accent",
    accent: "group-hover:bg-accent/15",
  },
  {
    icon: TrendingUp,
    title: "Price Guide",
    description: "Track market trends and get accurate valuations for Indian coins.",
    href: "/price-guide",
    color: "bg-stone/20 text-charcoal",
    accent: "group-hover:bg-stone/30",
  },
];

export function QuickActions() {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={action.href}
                  className="group block h-full"
                >
                  <div className={`h-full p-6 rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${action.accent}`}>
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 transition-colors`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif font-semibold text-lg text-foreground mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
