import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { coinCategories } from "@/data/mockCoins";

const categoryColors = [
  "from-gold/20 to-gold/5",
  "from-emerald/20 to-emerald/5",
  "from-stone/30 to-stone/10",
  "from-charcoal/20 to-charcoal/5",
  "from-gold/15 to-emerald/10",
  "from-emerald/15 to-gold/10",
];

export function CategoryShowcase() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-secondary/30">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Explore by Era
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Journey through India's rich numismatic heritage. From ancient kingdoms to modern republic.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {coinCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link
                to={`/marketplace?category=${category.id}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-card border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${categoryColors[index % categoryColors.length]}`} />
                  </div>

                  {/* Content */}
                  <div className="relative h-full p-4 flex flex-col justify-end">
                    <span className="text-xs font-medium text-gold-dark mb-1">
                      {category.count} coins
                    </span>
                    <h3 className="font-serif font-semibold text-foreground text-sm md:text-base mb-0.5">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
