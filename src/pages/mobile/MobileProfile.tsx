import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Bookmark, Star, ChevronRight,
  Shield, Edit2, LogOut, Award, UserCheck, User, ShoppingBag, FileText, Palette, LayoutDashboard, UserCog, Crown, Sparkles, MapPin, Download, DollarSign, MessageSquare, Calendar, Loader2, Eye, Search, Filter, X
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
  location?: string | null;
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
  
  // Data states
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [expertRequests, setExpertRequests] = useState<any[]>([]);
  const [sessionDocuments, setSessionDocuments] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price">("newest");
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserRole();
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      await Promise.all([
        fetchWishlist(),
        fetchOrders(),
        fetchExpertRequests(),
        fetchSessionDocuments(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          coin:coin_listings(
            id,
            title,
            price,
            images:coin_images(url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map((item: any) => ({
          id: item.coin?.id || item.coin_id,
          title: item.coin?.title || 'Unknown Coin',
          price: item.coin?.price || 0,
          image: item.coin?.images?.[0]?.url || coinMughalFront,
        }));
        setWishlist(formatted);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            coin:coin_listings(title, images:coin_images(url))
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchExpertRequests = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('auth_requests')
        .select(`
          *,
          expert:profiles!assigned_expert_id(display_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setExpertRequests(data || []);
        // Calculate total spent
        const spent = data.reduce((sum: number, req: any) => {
          return sum + (Number(req.paid_amount) || 0);
        }, 0);
        setTotalSpent(spent);
      }
    } catch (error) {
      console.error('Error fetching expert requests:', error);
    }
  };

  const fetchSessionDocuments = async () => {
    if (!user) return;
    try {
      const { data, error } = await (supabase.from('session_documents' as any) as any)
        .select(`
          *,
          request:auth_requests(
            id,
            status,
            created_at,
            expert:profiles!assigned_expert_id(display_name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSessionDocuments(data || []);
      }
    } catch (error) {
      // Table might not exist yet, that's okay
      console.log('Session documents table not found (non-blocking):', error);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    try {
      // Try with user_id first, then id
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error || !data) {
        // Try with id field
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }
      
      if (error && error.code !== 'PGRST116') {
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
        <Button onClick={() => navigate('/auth')} className="w-full max-w-xs h-14 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold shadow-[0_8px_32px_rgba(96,165,250,0.4)]">
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
              onClick={() => navigate('/profile/setup')} 
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30 hover:from-gold/30 hover:to-gold/20 transition-colors text-sm font-semibold text-gold"
              whileTap={{ scale: 0.95 }}
            >
              Edit
            </motion.button>
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
              <div className="absolute inset-0 rounded-full border-4 border-gold/40 shadow-[0_0_30px_rgba(96,165,250,0.3)]" />
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
            {profile?.location && (
              <p className="text-xs text-muted-foreground/80 max-w-xs mx-auto flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </p>
            )}

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

            {/* Spending Summary */}
            {totalSpent > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4 px-4 py-3 rounded-2xl bg-gradient-to-br from-gold/20 via-gold/15 to-gold/10 border border-gold/30 max-w-sm mx-auto"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gold" />
                    <span className="text-sm text-muted-foreground">Total Spent</span>
                  </div>
                  <span className="font-bold text-gold text-lg">₹{totalSpent.toLocaleString()}</span>
                </div>
              </motion.div>
            )}

            {/* Premium Action Buttons */}
            <div className="flex gap-3 mt-6 max-w-sm mx-auto">
              <Button 
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold shadow-[0_8px_32px_rgba(96,165,250,0.4)] hover:shadow-[0_12px_40px_rgba(96,165,250,0.5)]" 
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
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold shadow-[0_8px_32px_rgba(96,165,250,0.4)] hover:shadow-[0_12px_40px_rgba(96,165,250,0.5)]" 
                    onClick={() => navigate('/admin')}
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    Admin Dashboard
                  </Button>
                )}
                {isExpert && !isAdmin && (
                  <Button 
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold shadow-[0_8px_32px_rgba(96,165,250,0.4)] hover:shadow-[0_12px_40px_rgba(96,165,250,0.5)]" 
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
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery(""); // Clear search when switching tabs
                    setStatusFilter("all"); // Reset filters
                  }}
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
          
          {/* Search and Filter Bar - Show for tabs with data */}
          {(activeTab === "wishlist" || activeTab === "orders" || activeTab === "auth-requests") && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 space-y-2"
            >
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === "wishlist" ? "wishlist" : activeTab === "orders" ? "orders" : "requests"}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/50"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              
              {/* Filter Bar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                    showFilters || statusFilter !== "all" || sortBy !== "newest"
                      ? "bg-gold/20 text-gold border border-gold/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex-1 flex items-center gap-2"
                  >
                    {/* Status Filter (for orders and requests) */}
                    {(activeTab === "orders" || activeTab === "auth-requests") && (
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                      >
                        <option value="all">All Status</option>
                        {activeTab === "orders" ? (
                          <>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </>
                        ) : (
                          <>
                            <option value="pending">Pending</option>
                            <option value="in_review">In Review</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                          </>
                        )}
                      </select>
                    )}
                    
                    {/* Sort By */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "price")}
                      className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      {activeTab === "wishlist" && <option value="price">Price</option>}
                    </select>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </section>

        {/* Premium Content */}
        <section className="py-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                {activeTab === "wishlist" && (
                  <motion.div
                    key="wishlist"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    {(() => {
                      // Filter and sort wishlist
                      let filtered = wishlist;
                      
                      // Apply search filter
                      if (searchQuery.trim()) {
                        filtered = filtered.filter(item =>
                          item.title?.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                      }
                      
                      // Apply sorting
                      filtered = [...filtered].sort((a, b) => {
                        if (sortBy === "newest") return 0; // Already sorted by created_at desc
                        if (sortBy === "oldest") return 0; // Would need created_at field
                        if (sortBy === "price") return (b.price || 0) - (a.price || 0);
                        return 0;
                      });
                      
                      return filtered.length > 0 ? (
                        filtered.map((item, index) => (
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
                        ))
                      ) : (
                        <div className="col-span-3 py-16 text-center">
                          {searchQuery ? (
                            <>
                              <Search className="w-12 h-12 text-gold/40 mx-auto mb-4" />
                              <p className="text-muted-foreground mb-2">No results found</p>
                              <p className="text-xs text-muted-foreground">Try a different search term</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                                className="mt-4 border-gold/30 text-gold hover:bg-gold/10"
                              >
                                Clear Search
                              </Button>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-12 h-12 text-gold/40 mx-auto mb-4" />
                              <p className="text-muted-foreground mb-2">No saved coins yet</p>
                              <p className="text-xs text-muted-foreground mb-4">Start building your collection!</p>
                              <Button
                                onClick={() => navigate('/marketplace')}
                                className="bg-gradient-to-r from-gold via-gold-light to-gold text-black"
                              >
                                Browse Marketplace
                              </Button>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {activeTab === "orders" && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    {(() => {
                      // Filter and sort orders
                      let filtered = orders;
                      
                      // Apply search filter
                      if (searchQuery.trim()) {
                        filtered = filtered.filter(order =>
                          order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.items?.some((item: any) => 
                            item.coin?.title?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                        );
                      }
                      
                      // Apply status filter
                      if (statusFilter !== "all") {
                        filtered = filtered.filter(order => order.status === statusFilter);
                      }
                      
                      // Apply sorting
                      filtered = [...filtered].sort((a, b) => {
                        if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                        if (sortBy === "price") return Number(b.total_amount || 0) - Number(a.total_amount || 0);
                        return 0;
                      });
                      
                      return filtered.length > 0 ? (
                        filtered.map((order) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded-2xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/20 hover:border-gold/40 transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-foreground">Order #{order.id.slice(0, 8)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gold">₹{Number(order.total_amount).toLocaleString()}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                  order.status === 'processing' || order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                                  'bg-yellow-500/20 text-yellow-500'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-16 text-center">
                          {searchQuery || statusFilter !== "all" ? (
                            <>
                              <Search className="w-12 h-12 text-gold/40 mx-auto mb-4" />
                              <p className="text-muted-foreground mb-2">No orders match your filters</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchQuery("");
                                  setStatusFilter("all");
                                }}
                                className="mt-4 border-gold/30 text-gold hover:bg-gold/10"
                              >
                                Clear Filters
                              </Button>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-12 h-12 text-gold/40 mx-auto mb-4" />
                              <p className="text-muted-foreground mb-2">No orders yet</p>
                              <p className="text-xs text-muted-foreground mb-4">Start shopping to see your orders here</p>
                              <Button
                                onClick={() => navigate('/marketplace')}
                                className="bg-gradient-to-r from-gold via-gold-light to-gold text-black"
                              >
                                Browse Marketplace
                              </Button>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {activeTab === "auth-requests" && (
                  <motion.div
                    key="auth-requests"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    {(() => {
                      // Filter and sort expert requests
                      let filtered = expertRequests;
                      
                      // Apply search filter
                      if (searchQuery.trim()) {
                        filtered = filtered.filter(request =>
                          request.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.expert?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.description?.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                      }
                      
                      // Apply status filter
                      if (statusFilter !== "all") {
                        filtered = filtered.filter(request => request.status === statusFilter);
                      }
                      
                      // Apply sorting
                      filtered = [...filtered].sort((a, b) => {
                        if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                        if (sortBy === "price") return Number(b.paid_amount || 0) - Number(a.paid_amount || 0);
                        return 0;
                      });
                      
                      if (filtered.length > 0) {
                        return filtered.map((request) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded-2xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/20 hover:border-gold/40 transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Shield className="w-4 h-4 text-gold" />
                                  <p className="font-semibold text-foreground">Expert Authentication</p>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {new Date(request.created_at).toLocaleDateString()}
                                </p>
                                {request.expert && (
                                  <p className="text-xs text-muted-foreground">
                                    Expert: {request.expert.display_name}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gold">₹{Number(request.paid_amount || 0).toLocaleString()}</p>
                                <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                                  request.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                  request.status === 'in_review' ? 'bg-blue-500/20 text-blue-500' :
                                  'bg-yellow-500/20 text-yellow-500'
                                }`}>
                                  {request.status}
                                </span>
                              </div>
                            </div>
                            {request.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 border-gold/30 text-gold hover:bg-gold/10"
                                onClick={() => navigate(`/session/${request.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            )}
                            {(request.status === 'in_review' || request.status === 'assigned') && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 border-gold/30 text-gold hover:bg-gold/10"
                                onClick={() => navigate(`/expert-chat/${request.id}`)}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Continue Chat
                              </Button>
                            )}
                          </motion.div>
                        ));
                      }
                      
                      return (
                        <div className="py-16 text-center">
                          {searchQuery || statusFilter !== "all" ? (
                            <>
                              <Search className="w-12 h-12 text-gold/40 mx-auto mb-4" />
                              <p className="text-muted-foreground mb-2">No requests match your filters</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchQuery("");
                                  setStatusFilter("all");
                                }}
                                className="mt-4 border-gold/30 text-gold hover:bg-gold/10"
                              >
                                Clear Filters
                              </Button>
                            </>
                          ) : (
                            <>
                              <FileText className="w-12 h-12 text-gold/40 mx-auto mb-4" />
                              <p className="text-muted-foreground mb-2">No expert requests yet</p>
                              <p className="text-xs text-muted-foreground mb-4">Get your coins authenticated by experts</p>
                              <Button
                                onClick={() => navigate('/authenticate')}
                                className="bg-gradient-to-r from-gold via-gold-light to-gold text-black"
                              >
                                Request Authentication
                              </Button>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {activeTab === "collections" && (
                  <motion.div
                    key="collections"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    {/* Session Documents */}
                    {sessionDocuments.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gold" />
                          Session Documents
                        </h3>
                        <div className="space-y-2">
                          {sessionDocuments.map((doc) => (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-3 rounded-xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border border-gold/20 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center border border-gold/30">
                                  <FileText className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">
                                    Session #{doc.request?.id?.slice(0, 8) || 'N/A'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.request?.expert?.display_name || 'Expert'} • {new Date(doc.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gold/30 text-gold hover:bg-gold/10"
                                onClick={() => {
                                  if (doc.document_url) {
                                    // If it's a data URL, create download
                                    if (doc.document_url.startsWith('data:')) {
                                      const link = document.createElement('a');
                                      link.href = doc.document_url;
                                      link.download = `session_${doc.request?.id?.slice(0, 8) || 'document'}.txt`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    } else {
                                      window.open(doc.document_url, '_blank');
                                    }
                                  } else if (doc.document_content) {
                                    // Generate document from content
                                    const content = doc.document_content as any;
                                    let text = `Session Document\n\n`;
                                    if (content.messages) {
                                      content.messages.forEach((msg: any) => {
                                        text += `[${msg.timestamp}] ${msg.sender}:\n${msg.content}\n\n`;
                                      });
                                    }
                                    const blob = new Blob([text], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `session_${doc.request?.id?.slice(0, 8) || 'document'}.txt`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(url);
                                  }
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Collections placeholder */}
                    <div className="py-16 text-center">
                      <Star className="w-12 h-12 text-gold/40 mx-auto mb-4" />
                      <p className="text-muted-foreground">No collections yet</p>
                    </div>
                  </motion.div>
                )}
              </>
            )}
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
