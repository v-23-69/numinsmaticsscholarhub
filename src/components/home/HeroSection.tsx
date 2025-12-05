import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24 lg:py-32">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-emerald/5 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6">
              <Award className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold-dark">
                India's Premier Numismatic Platform
              </span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 text-balance">
              Discover, Authenticate & Collect{" "}
              <span className="text-gold-gradient">Rare Coins</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Join thousands of collectors on India's most trusted marketplace for historical coins. 
              Expert authentication, secure transactions, and a passionate community.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="btn-gold rounded-2xl px-8 h-14 text-base font-semibold w-full sm:w-auto"
                asChild
              >
                <Link to="/marketplace">
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-8 h-14 text-base font-medium border-2 w-full sm:w-auto"
                asChild
              >
                <Link to="/authenticate">
                  <Shield className="w-5 h-5 mr-2" />
                  Authenticate a Coin
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-border/60 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl md:text-3xl font-serif font-bold text-foreground">15K+</p>
                <p className="text-sm text-muted-foreground">Active Listings</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-serif font-bold text-foreground">2.5K+</p>
                <p className="text-sm text-muted-foreground">Verified Sellers</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-serif font-bold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">Collectors</p>
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main Coin Image */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-gold/20 via-gold/10 to-transparent" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold shadow-2xl shadow-gold/30 flex items-center justify-center">
                  <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light flex items-center justify-center text-charcoal">
                    <div className="text-center">
                      <span className="block font-serif text-4xl md:text-5xl font-bold">₹</span>
                      <span className="block font-serif text-lg md:text-xl mt-1 font-semibold tracking-wider">1835</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute top-4 left-1/4 w-12 h-12 rounded-full bg-emerald/20 backdrop-blur-sm border border-emerald/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald" />
                </div>
                <div className="absolute bottom-8 right-4 w-12 h-12 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-gold" />
                </div>
                <div className="absolute top-1/3 right-0 w-12 h-12 rounded-full bg-stone/30 backdrop-blur-sm border border-stone/40 flex items-center justify-center">
                  <Users className="w-5 h-5 text-stone-dark" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
