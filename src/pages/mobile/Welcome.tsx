import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Coins, Users, ArrowRight } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Expert Authentication",
      description: "Get your coins verified by certified numismatic experts"
    },
    {
      icon: Coins,
      title: "Premium Marketplace",
      description: "Buy and sell rare coins in a trusted marketplace"
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with collectors and share your passion"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(var(--blue-light))] to-background flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-[0.02] dark:opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--gold)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue/10 via-transparent to-gold/5 pointer-events-none" />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold flex items-center justify-center shadow-[0_8px_32px_rgba(250,204,21,0.3)]"
          >
            <Sparkles className="w-12 h-12 text-black" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
            Numismatic Scholar Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Your trusted platform for coin authentication, trading, and collecting
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md space-y-4 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-gold/20 hover:border-gold/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center flex-shrink-0 border border-gold/30">
                <feature.icon className="w-6 h-6 text-gold" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="w-full max-w-md"
        >
          <Button
            onClick={() => navigate('/auth')}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold text-base shadow-[0_8px_32px_rgba(250,204,21,0.4)] hover:shadow-[0_12px_40px_rgba(250,204,21,0.5)] transition-all"
            size="lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <button
              onClick={() => navigate('/auth')}
              className="text-gold font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
