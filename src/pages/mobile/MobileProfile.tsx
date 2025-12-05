import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Settings, Grid3X3, Bookmark, Star, ChevronRight, 
  Shield, Edit2, LogOut, Award, UserCheck
} from "lucide-react";
import { MobileNavBar } from "@/components/mobile/MobileNavBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import coinMughalFront from "@/assets/coin-mughal-front.jpg";
import coinBritishFront from "@/assets/coin-british-front.jpg";
import coinAncientFront from "@/assets/coin-ancient-front.jpg";

const mockUser = {
  id: "1",
  username: "coin_collector",
  displayName: "Rajesh Sharma",
  avatar: "https://i.pravatar.cc/150?img=33",
  bio: "Passionate numismatist since 2010. Specializing in Mughal & British India coins. NSH Verified Seller ✓",
  isVerified: true,
  isSeller: true,
  stats: {
    posts: 124,
    followers: 2340,
    following: 567,
    collections: 8,
  },
  badges: ["Early Adopter", "Top Seller", "Expert Reviewer"],
};

const tabs = [
  { id: "posts", label: "Posts", icon: Grid3X3 },
  { id: "collections", label: "Collections", icon: Bookmark },
  { id: "wishlist", label: "Wishlist", icon: Star },
  { id: "reviews", label: "Reviews", icon: Award },
];

const mockPosts = [
  { id: "1", image: coinMughalFront },
  { id: "2", image: coinBritishFront },
  { id: "3", image: coinAncientFront },
  { id: "4", image: coinMughalFront },
  { id: "5", image: coinBritishFront },
  { id: "6", image: coinAncientFront },
];

export default function MobileProfile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/40 safe-area-inset-top">
        <div className="flex items-center justify-between h-14 px-4">
          <span className="font-serif font-semibold text-lg">{mockUser.username}</span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 -mr-2"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-4">
        {/* Profile Header */}
        <section className="py-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={mockUser.avatar}
                alt={mockUser.displayName}
                className="w-20 h-20 rounded-full object-cover border-2 border-gold/30"
              />
              {mockUser.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald flex items-center justify-center border-2 border-background">
                  <Shield className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-semibold">{mockUser.stats.posts}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{mockUser.stats.followers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{mockUser.stats.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{mockUser.stats.collections}</p>
                <p className="text-xs text-muted-foreground">Collections</p>
              </div>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">{mockUser.displayName}</h1>
              {mockUser.isSeller && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-gold/10 text-gold-dark rounded-full">
                  Seller
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{mockUser.bio}</p>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {mockUser.badges.map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-1 text-[10px] font-medium bg-secondary text-secondary-foreground rounded-full"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button className="flex-1 btn-primary rounded-xl h-9">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl h-9">
              Share Profile
            </Button>
          </div>
        </section>

        {/* Tabs */}
        <section className="sticky top-14 z-30 -mx-4 px-4 bg-background border-b border-border/60">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium hidden sm:block">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Content Grid */}
        <section className="py-2 -mx-4">
          {activeTab === "posts" && (
            <div className="grid grid-cols-3 gap-0.5">
              {mockPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="aspect-square"
                >
                  <img
                    src={post.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </Link>
              ))}
            </div>
          )}
          
          {activeTab !== "posts" && (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <p>No {activeTab} yet</p>
            </div>
          )}
        </section>
      </main>

      {/* Settings Drawer */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-charcoal/50"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 safe-area-inset-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
            <nav className="space-y-2">
              <Link
                to="/settings/profile"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Edit2 className="w-5 h-5" />
                  <span>Edit Profile</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link
                to="/settings/kyc"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5" />
                  <span>KYC Verification</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <Link
                to="/dashboard/seller"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5" />
                  <span>Seller Dashboard</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
              <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary text-destructive">
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </nav>
          </motion.div>
        </motion.div>
      )}

      <MobileNavBar />
    </div>
  );
}
