import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Bookmark, Star, ChevronRight,
  Shield, Edit2, LogOut, Award, UserCheck, User, ShoppingBag, FileText, Palette, Sun, Moon, Monitor,
  Wallet, LayoutDashboard, Coins, Plus
} from "lucide-react";
import { PremiumNavBar } from "@/components/mobile/PremiumNavBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import coinMughalFront from "@/assets/coin-mughal-front.jpg";
import coinBritishFront from "@/assets/coin-british-front.jpg";
import coinAncientFront from "@/assets/coin-ancient-front.jpg";

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean | null;
  role?: 'user' | 'expert' | 'admin' | null;
  badges: string[];
}

const tabs = [
  { id: "wishlist", label: "Wishlist", icon: Bookmark },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "collections", label: "Collections", icon: Star },
  { id: "auth-requests", label: "Auth Requests", icon: FileText },
];

const mockWishlist = [
  { id: "1", image: coinMughalFront, title: "Shah Jahan Mohur", price: 285000 },
  { id: "2", image: coinBritishFront, title: "Victoria Rupee", price: 45000 },
  { id: "3", image: coinAncientFront, title: "Gupta Dinar", price: 450000 },
];

export default function MobileProfile() {
  const [activeTab, setActiveTab] = useState("wishlist");
  const [showSettings, setShowSettings] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const { user, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchWalletBalance();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile({ ...data, badges: Array.isArray(data.badges) ? data.badges as string[] : [] });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchWalletBalance = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc('get_wallet_balance');
      if (error) {
        // Fallback: direct query
        const { data: walletData } = await supabase
          .from('nsh_wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        setWalletBalance(walletData?.balance || 0);
      } else {
        setWalletBalance(data || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(0);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: 'Signed out successfully' });
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col items-center justify-center px-6">
        <div className="story-ring w-24 h-24 mb-6">
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-xl font-serif font-bold mb-2">Welcome to NSH</h2>
        <p className="text-muted-foreground text-center mb-6">Sign in to access your profile and collections</p>
        <Button onClick={() => navigate('/auth')} className="w-full max-w-xs btn-gold h-12 rounded-xl">
          Sign In / Sign Up
        </Button>
        <PremiumNavBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40 safe-area-inset-top">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="flex items-center justify-between h-14 px-4">
          <span className="font-serif font-semibold text-lg">{profile?.username || 'Profile'}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('wishlist')} className="p-2 relative">
              <Bookmark className="w-5 h-5" />
            </button>
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mr-1" />
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 -mr-2">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4">
        {/* Profile Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="story-ring w-28 h-28 mx-auto mb-5"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </motion.div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="font-serif font-bold text-2xl">{profile?.display_name || 'Collector'}</h1>
            {profile?.is_verified && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Shield className="w-6 h-6 text-gold" />
              </motion.div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">{profile?.bio || 'Coin collector & enthusiast'}</p>

          {profile?.badges && profile.badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2 mb-4"
            >
              {profile.badges.map((badge, index) => (
                <motion.span
                  key={badge}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="badge-gold"
                >
                  {badge}
                </motion.span>
              ))}
            </motion.div>
          )}

          <div className="flex gap-3 mt-6 max-w-xs mx-auto">
            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
              <Button className="w-full btn-gold rounded-xl h-11" onClick={() => navigate('/profile/setup')}>
                <Edit2 className="w-4 h-4 mr-2" />Edit
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
              <Button variant="outline" className="w-full rounded-xl h-11 border-gold/40 hover:bg-gold/10">
                Share
              </Button>
            </motion.div>
          </div>

          {/* NSH Wallet Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 mx-4"
          >
            <div className="card-gold-trim p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">NSH Wallet</h3>
                    <p className="text-xs text-muted-foreground">Your coin balance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold gold-text">{walletBalance}</p>
                  <p className="text-xs text-muted-foreground">NSH Coins</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-gold/40 text-gold hover:bg-gold/10"
                onClick={() => toast({ title: "Coming Soon", description: "Payment integration will be added soon" })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Coins
              </Button>
            </div>
          </motion.div>

          {/* Admin Dashboard Button (Role-based) */}
          {(profile?.role === 'admin' || profile?.role === 'expert') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 mx-4"
            >
              <Button
                className="w-full btn-gold rounded-xl h-12"
                onClick={() => navigate('/admin')}
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                {profile?.role === 'admin' ? 'Admin Dashboard' : 'Expert Dashboard'}
              </Button>
            </motion.div>
          )}
        </motion.section>

        {/* Tabs */}
        <section className="sticky top-14 z-30 -mx-4 px-4 bg-background border-b border-border/60">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors",
                  activeTab === tab.id ? "border-gold text-gold" : "border-transparent text-muted-foreground"
                )}
              >
                <tab.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </section>

        {/* Content */}
        <section className="py-4">
          {activeTab === "wishlist" && (
            <div className="grid grid-cols-3 gap-2">
              {mockWishlist.map((item) => (
                <Link key={item.id} to={`/marketplace/coin/${item.id}`} className="aspect-square rounded-xl overflow-hidden border border-gold/20">
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                </Link>
              ))}
            </div>
          )}
          {activeTab !== "wishlist" && (
            <div className="py-12 text-center text-muted-foreground">
              <p>No {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} yet</p>
            </div>
          )}
        </section>
      </main>

      {/* Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl border-t border-gold/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <nav className="p-4 space-y-2 pb-safe">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowSettings(false);
                    setShowThemeSelector(true);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted/30 card-embossed transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-gold" />
                  </div>
                  <span className="flex-1 font-medium text-left">Theme</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System"}
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.button>
                <Link
                  to="/settings"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/30 card-embossed transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-gold" />
                  </div>
                  <span className="flex-1 font-medium">Settings</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
                <Link
                  to="/profile/setup"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/30 card-embossed transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-gold" />
                  </div>
                  <span className="flex-1 font-medium">Edit Profile</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-destructive/10 card-embossed text-destructive transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Log Out</span>
                </motion.button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Selector Bottom Sheet */}
      <AnimatePresence>
        {showThemeSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowThemeSelector(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl border-t border-gold/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>
              <div className="px-6 pb-4 border-b border-gold/10">
                <h2 className="font-serif text-xl font-semibold text-center">Choose Theme</h2>
                <p className="text-sm text-muted-foreground text-center mt-1">Select your preferred appearance</p>
              </div>
              <div className="p-4 space-y-3 pb-safe">
                {[
                  { id: "system" as const, label: "System Default", icon: Monitor },
                  { id: "light" as const, label: "Cream & Gold", icon: Sun },
                  { id: "dark" as const, label: "Black & Gold", icon: Moon },
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = theme === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setTheme(option.id);
                        setShowThemeSelector(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
                        isSelected
                          ? "card-gold-trim shadow-lg shadow-gold/30"
                          : "card-embossed hover:bg-muted/30"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        option.id === "dark"
                          ? "bg-[#0B0B0C] border border-gold/30"
                          : option.id === "light"
                            ? "bg-[#F8F3E8] border border-gold/30"
                            : "bg-gradient-to-br from-[#F8F3E8] to-[#0B0B0C] border border-gold/30"
                      )}>
                        <Icon className={cn(
                          "w-6 h-6",
                          option.id === "dark" ? "text-gold" : "text-gold-dark"
                        )} />
                      </div>
                      <span className={cn(
                        "flex-1 text-left font-medium",
                        isSelected && "text-gold"
                      )}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                          <Star className="w-4 h-4 text-background fill-current" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumNavBar />
    </div>
  );
}
