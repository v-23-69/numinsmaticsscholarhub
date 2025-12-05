import { motion } from "framer-motion";
import { Shield, Lock, Award, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Expert Authentication",
    description: "Every verified coin backed by numismatic experts",
  },
  {
    icon: Lock,
    title: "Secure Escrow",
    description: "Protected transactions for high-value items",
  },
  {
    icon: Award,
    title: "Verified Sellers",
    description: "Strict vetting for all marketplace sellers",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Collector-first customer service team",
  },
];

export function TrustBanner() {
  return (
    <section className="py-12 md:py-16 bg-gradient-emerald text-primary-foreground">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">
            Trusted by 50,000+ Collectors
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            NSH is built on trust, expertise, and a passion for numismatics.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-sm md:text-base mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-primary-foreground/70">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
