import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Edit, Shield, CheckCheck, Check } from "lucide-react";
import { MobileNavBar } from "@/components/mobile/MobileNavBar";
import { cn } from "@/lib/utils";

interface Thread {
  id: string;
  user: {
    name: string;
    avatar: string;
    isExpert?: boolean;
    isVerified?: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
  type: "dm" | "expert" | "support";
}

const mockThreads: Thread[] = [
  {
    id: "1",
    user: { name: "Dr. Anand Kumar", avatar: "https://i.pravatar.cc/150?img=12", isExpert: true },
    lastMessage: "I've completed the authentication. Your Shah Jahan mohur is genuine!",
    timestamp: "2m ago",
    unread: 2,
    type: "expert",
  },
  {
    id: "2",
    user: { name: "Heritage Coins", avatar: "https://i.pravatar.cc/150?img=10", isVerified: true },
    lastMessage: "Yes, the coin is still available. Would you like to proceed?",
    timestamp: "1h ago",
    unread: 0,
    type: "dm",
  },
  {
    id: "3",
    user: { name: "NumisVault", avatar: "https://i.pravatar.cc/150?img=15" },
    lastMessage: "Thanks for the purchase! Shipping tomorrow.",
    timestamp: "3h ago",
    unread: 0,
    type: "dm",
  },
  {
    id: "4",
    user: { name: "Expert Support", avatar: "https://i.pravatar.cc/150?img=20", isExpert: true },
    lastMessage: "Your video consultation is scheduled for tomorrow at 3 PM",
    timestamp: "1d ago",
    unread: 1,
    type: "expert",
  },
  {
    id: "5",
    user: { name: "NSH Support", avatar: "https://i.pravatar.cc/150?img=25" },
    lastMessage: "How can we help you today?",
    timestamp: "2d ago",
    unread: 0,
    type: "support",
  },
];

export default function MobileMessages() {
  const [activeTab, setActiveTab] = useState<"all" | "expert" | "dm">("all");

  const filteredThreads = mockThreads.filter((thread) => {
    if (activeTab === "all") return true;
    if (activeTab === "expert") return thread.type === "expert";
    return thread.type === "dm";
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/40 safe-area-inset-top">
        <div className="flex items-center justify-between h-14 px-4">
          <span className="font-serif font-semibold text-lg">Messages</span>
          <button className="p-2 -mr-2">
            <Edit className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-3">
          {[
            { id: "all", label: "All" },
            { id: "expert", label: "Experts" },
            { id: "dm", label: "Sellers" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Threads */}
      <main className="divide-y divide-border/40">
        {filteredThreads.map((thread, index) => (
          <motion.div
            key={thread.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={`/messages/${thread.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={thread.user.avatar}
                  alt={thread.user.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {thread.user.isExpert && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald flex items-center justify-center border-2 border-background">
                    <Shield className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm truncate">
                      {thread.user.name}
                    </span>
                    {thread.user.isVerified && (
                      <Shield className="w-3.5 h-3.5 text-emerald fill-emerald/20 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {thread.timestamp}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground truncate flex-1">
                    {thread.lastMessage}
                  </p>
                  {thread.unread > 0 ? (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                      {thread.unread}
                    </span>
                  ) : (
                    <CheckCheck className="w-4 h-4 text-emerald shrink-0" />
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </main>

      <MobileNavBar />
    </div>
  );
}
