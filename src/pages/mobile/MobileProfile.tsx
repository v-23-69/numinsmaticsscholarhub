import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Settings, Bookmark, Star, ChevronRight,
  Shield, Edit2, LogOut, Award, UserCheck, User, ShoppingBag, FileText, Palette, LayoutDashboard, UserCog
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
  role?: string | null; // 'user' | 'expert' | 'admin'
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
  const [userRole, setUserRole] = useState<string | null>(null); // For user_roles table
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
      // Use 'id' instead of 'user_id' - in this schema, id IS the user_id
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (error) {
        console.warn('Error fetching profile (non-blocking):', error);
        return;
      }
      if (data) {
        setProfile({ ...data, badges: Array.isArray(data.badges) ? data.badges as string[] : [] });
      } else {
        // Profile doesn't exist - this is okay, user might need to complete profile setup
        console.log('Profile not found for user');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserRole = async () => {
    if (!user) return;
    try {
      // Check user_roles table (if using that schema)
      const { data, error } = await (supabase.from('user_roles' as any) as any)
        .select('role')
        .eq('user_id', user.id);
      
      if (!error && data && data.length > 0) {
        // Get all roles and find expert or admin
        const roles = data.map((r: any) => r.role);
        // Map app_role to simple role names
        const roleMap: Record<string, string> = {
          'admin_market': 'admin',
          'master_admin': 'admin',
          'expert': 'expert',
          'buyer': 'user',
          'seller': 'user'
        };
        
        // Check for expert or admin roles
        if (roles.includes('expert')) {
          setUserRole('expert');
        } else if (roles.includes('admin_market') || roles.includes('master_admin')) {
          setUserRole('admin');
        }
      }
    } catch (error) {
      // user_roles table might not exist, that's okay
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
        <section className="py-6 text-center">
          <div className="story-ring w-24 h-24 mx-auto mb-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="font-serif font-bold text-xl">{profile?.display_name || 'Collector'}</h1>
            {profile?.is_verified && <Shield className="w-5 h-5 text-gold" />}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{profile?.bio || 'Coin collector & enthusiast'}</p>

          {profile?.badges && profile.badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {profile.badges.map((badge) => (
                <span key={badge} className="badge-gold">{badge}</span>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4 max-w-xs mx-auto">
            <Button className="flex-1 btn-gold rounded-xl h-10" onClick={() => navigate('/profile/setup')}>
              <Edit2 className="w-4 h-4 mr-2" />Edit
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl h-10 border-gold/40">Share</Button>
          </div>

          {/* Admin/Expert Dashboard Access */}
          {(() => {
            const role = profile?.role || userRole;
            const isAdmin = role === 'admin' || role === 'admin_market' || role === 'master_admin';
            const isExpert = role === 'expert';
            
            if (isAdmin || isExpert) {
              return (
                <div className="mt-4 max-w-xs mx-auto space-y-2">
                  {isAdmin && (
                    <Button 
                      className="w-full btn-gold rounded-xl h-10" 
                      onClick={() => navigate('/admin')}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  )}
                  {isExpert && !isAdmin && (
                    <Button 
                      className="w-full btn-gold rounded-xl h-10" 
                      onClick={() => navigate('/expert/dashboard')}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Expert Dashboard
                    </Button>
                  )}
                </div>
              );
            }
            return null;
          })()}
        </section>

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
      {showSettings && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ type: "spring", damping: 25 }} className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-border" /></div>
            <nav className="p-4 space-y-2 pb-safe">
              <Link to="/settings" className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/30 card-embossed">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center"><Palette className="w-5 h-5 text-gold" /></div>
                <span className="flex-1 font-medium">Theme & Settings</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link to="/profile/setup" className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/30 card-embossed">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center"><Edit2 className="w-5 h-5 text-gold" /></div>
                <span className="flex-1 font-medium">Edit Profile</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-destructive/10 card-embossed text-destructive">
                <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center"><LogOut className="w-5 h-5" /></div>
                <span className="font-medium">Log Out</span>
              </button>
            </nav>
          </motion.div>
        </motion.div>
      )}

      <PremiumNavBar />
    </div>
  );
}
