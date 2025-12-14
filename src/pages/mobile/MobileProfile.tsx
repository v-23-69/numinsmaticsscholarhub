import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Bookmark, Star, ChevronRight,
  Shield, Edit2, LogOut, Award, UserCheck, User, ShoppingBag, FileText, Palette, LayoutDashboard, UserCog, Crown, Sparkles
} from "lucide-react";
import { PremiumNavBar } from "@/components/mobile/PremiumNavBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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
  badges: string[];
  role?: string | null;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserRole();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (error) {
        console.warn('Error fetching profile (non-blocking):', error);
        return;
      }
      if (data) {
        setProfile({ ...data, badges: Array.isArray(data.badges) ? data.badges as string[] : [] });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserRole = async () => {
    if (!user) return;
    try {
      const { data, error } = await (supabase.from('user_roles' as any) as any)
        .select('role')
        .eq('user_id', user.id);
      
      if (!error && data && data.length > 0) {
        const roles = data.map((r: any) => r.role);
        const roleMap: Record<string, string> = {
          'admin_market': 'admin',
          'master_admin': 'admin',
          'expert': 'expert',
          'buyer': 'user',
          'seller': 'user'
        };
        
        if (roles.includes('expert')) {
          setUserRole('expert');
        } else if (roles.includes('admin_market') || roles.includes('master_admin')) {
          setUserRole('admin');
        }
      }
    } catch (error) {
      console.log('user_roles table not found or error (non-blocking):', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: 'Signed out successfully' });
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(var(--blue-light))] to-background pb-20 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="story-ring w-32 h-32 mb-8"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue/20 to-blue/15 flex items-center justify-center border-2 border-gold/30">
            <User className="h-16 w-16 text-gold/60" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-serif font-bold mb-3 bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">Welcome to NSH</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">Sign in to access your profile and collections</p>
        <Button onClick={() => navigate('/auth')} className="w-full max-w-xs h-14 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold shadow-[0_8px_32px_rgba(212,175,55,0.4)]">
          Sign In / Sign Up
        </Button>
        <PremiumNavBar />
      </div>
    );
  }

  const role = profile?.role || userRole;
  const isAdmin = role === 'admin' || role === 'admin_market' || role === 'master_admin';
  const isExpert = role === 'expert';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(var(--blue-light))] to-background pb-20 relative overflow-hidden">
      {/* Premium Background Pattern - Theme Aware */}
      <div className="fixed inset-0 opacity-[0.02] dark:opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--gold)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue/10 via-transparent to-gold/5 pointer-events-none" />

      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-card/95 via-[hsl(var(--blue-light)/0.95)] to-card/95 backdrop-blur-2xl border-b-2 border-gold/30 safe-area-inset-top shadow-2xl">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent shadow-[0_0_8px_hsl(var(--gold)/0.3)]" />
        <div className="flex items-center justify-between h-16 px-4">
          <span className="font-serif font-bold text-lg bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
            {profile?.username || 'Profile'}
          </span>
          <div className="flex items-center gap-2">
            <motion.button 
              onClick={() => setActiveTab('wishlist')} 
              className="p-2.5 rounded-xl hover:bg-blue/30 transition-colors relative"
              whileTap={{ scale: 0.95 }}
            >
              <Bookmark className="w-5 h-5 text-foreground" />
              {activeTab === 'wishlist' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold"
                />
              )}
            </motion.button>
            <motion.button 
              onClick={() => setShowSettings(!showSettings)} 
              className="p-2.5 rounded-xl hover:bg-blue/30 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 relative z-10">
        {/* Premium Profile Header */}
        <section className="py-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative inline-block mb-6"
          >
            <div className="relative w-32 h-32 mx-auto">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full" />
              {/* Avatar ring */}
              <div className="absolute inset-0 rounded-full border-4 border-gold/40 shadow-[0_0_30px_rgba(212,175,55,0.3)]" />
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="" 
                  className="w-full h-full rounded-full object-cover relative z-10" 
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue/30 via-blue/25 to-blue/30 flex items-center justify-center relative z-10 border-2 border-gold/20">
                  <User className="w-16 h-16 text-gold/60" />
                </div>
              )}
              {/* Verified badge */}
              {profile?.is_verified && (
                <div className="absolute -bottom-1 -right-1 z-20 w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center border-4 border-background shadow-lg">
                  <Shield className="w-5 h-5 text-black" />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-serif font-bold text-2xl bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                {profile?.display_name || 'Collector'}
              </h1>
              {isAdmin && (
                <div className="relative">
                  <Crown className="w-6 h-6 text-gold" />
                  <div className="absolute inset-0 bg-gold/30 blur-lg rounded-full" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {profile?.bio || 'Coin collector & enthusiast'}
            </p>

            {/* Premium Badges */}
            {profile?.badges && profile.badges.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {profile.badges.map((badge) => (
                  <motion.span
                    key={badge}
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gold/20 via-gold/15 to-gold/20 border border-gold/30 text-gold backdrop-blur-sm"
                  >
                    <Award className="w-3 h-3" />
                    {badge}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Premium Action Buttons */}
            <div className="flex gap-3 mt-6 max-w-sm mx-auto">
              <Button 
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold shadow-[0_8px_32px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.5)]" 
                onClick={() => navigate('/profile/setup')}
              >
                <Edit2 className="w-4 h-4 mr-2" />Edit
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-2xl border-2 border-gold/40 text-gold hover:bg-gold/10 font-semibold"
              >
                Share
              </Button>
            </div>

            {/* Premium Dashboard Access */}
            {(isAdmin || isExpert) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 max-w-sm mx-auto"
              >
                {isAdmin && (
                  <Button 
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold shadow-[0_8px_32px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.5)]" 
                    onClick={() => navigate('/admin')}
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    Admin Dashboard
                  </Button>
                )}
                {isExpert && !isAdmin && (
                  <Button 
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold shadow-[0_8px_32px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.5)]" 
                    onClick={() => navigate('/expert/dashboard')}
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    Expert Dashboard
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* Premium Tabs */}
        <section className="sticky top-16 z-30 -mx-4 px-4 bg-gradient-to-b from-card/95 via-[hsl(var(--blue-light)/0.95)] to-card/95 backdrop-blur-xl border-b border-gold/30 pb-2">
          <div className="flex gap-1 bg-gradient-to-br from-muted via-[hsl(var(--blue))] to-muted rounded-2xl p-1.5 border-2 border-gold/20">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all relative",
                    isActive 
                      ? "bg-gradient-to-r from-gold/20 via-gold/15 to-gold/20 text-gold border border-gold/30 shadow-lg" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold/20 via-gold/15 to-gold/20 border border-gold/30"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Premium Content */}
        <section className="py-6">
          <AnimatePresence mode="wait">
            {activeTab === "wishlist" && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-3 gap-3"
              >
                {mockWishlist.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                  >
                    <Link 
                      to={`/marketplace/coin/${item.id}`} 
                      className="block aspect-square rounded-2xl overflow-hidden border-2 border-gold/30 bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card shadow-lg hover:border-gold/50 hover:shadow-[0_8px_32px_hsl(var(--gold)/0.3)] transition-all group"
                    >
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <p className="text-[10px] font-bold text-gold truncate">{item.title}</p>
                        <p className="text-[9px] text-white/80">₹{item.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {activeTab !== "wishlist" && (() => {
              const activeTabData = tabs.find(t => t.id === activeTab);
              const Icon = activeTabData?.icon || FileText;
              return (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue/20 to-blue/15 border-2 border-gold/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-10 h-10 text-gold/60" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    No {activeTabData?.label.toLowerCase() || 'items'} yet
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-2">
                    Your {activeTabData?.label.toLowerCase() || 'items'} will appear here
                  </p>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </section>
      </main>

      {/* Premium Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t-2 border-gold/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-4 pb-3">
                <div className="w-12 h-1 rounded-full bg-gold/40" />
              </div>
              <div className="px-6 pb-4">
                <h3 className="font-serif font-bold text-xl text-foreground mb-6 text-center">Settings</h3>
              </div>
              <nav className="px-4 space-y-2 pb-safe pb-6">
                <Link
                  to="/settings"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-blue/30 to-blue/20 border border-gold/20 hover:border-gold/40 transition-all group"
                  onClick={() => setShowSettings(false)}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center border border-gold/30 group-hover:border-gold/50 transition-colors">
                    <Palette className="w-6 h-6 text-gold" />
                  </div>
                  <span className="flex-1 font-semibold text-foreground">Theme & Settings</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
                <Link
                  to="/profile/setup"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-blue/30 to-blue/20 border border-gold/20 hover:border-gold/40 transition-all group"
                  onClick={() => setShowSettings(false)}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center border border-gold/30 group-hover:border-gold/50 transition-colors">
                    <Edit2 className="w-6 h-6 text-gold" />
                  </div>
                  <span className="flex-1 font-semibold text-foreground">Edit Profile</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/30 hover:border-red-500/50 text-red-400 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30 group-hover:border-red-500/50 transition-colors">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <span className="font-semibold">Log Out</span>
                </button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumNavBar />
    </div>
  );
}
