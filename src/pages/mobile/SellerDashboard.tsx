import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Plus, Package, ShoppingCart, TrendingUp, 
  Wallet, ChevronRight, Eye, AlertCircle, CheckCircle,
  BarChart3, Clock
} from "lucide-react";
import { MobileNavBar } from "@/components/mobile/MobileNavBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Sales", value: "₹4,52,000", icon: TrendingUp, change: "+12%" },
  { label: "Active Listings", value: "24", icon: Package, change: "+3" },
  { label: "Pending Orders", value: "5", icon: ShoppingCart, change: "0" },
  { label: "Balance", value: "₹45,200", icon: Wallet, change: "" },
];

const recentOrders = [
  { id: "1", coin: "Shah Jahan Mohur", buyer: "Rahul S.", amount: 285000, status: "shipped" },
  { id: "2", coin: "Victoria Rupee", buyer: "Priya M.", amount: 45000, status: "processing" },
  { id: "3", coin: "Delhi Sultanate Tanka", buyer: "Amit K.", amount: 78000, status: "pending" },
];

const menuItems = [
  { label: "My Listings", icon: Package, href: "/dashboard/seller/listings", badge: "24" },
  { label: "Orders", icon: ShoppingCart, href: "/dashboard/seller/orders", badge: "5" },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/seller/analytics" },
  { label: "Payouts", icon: Wallet, href: "/dashboard/seller/payouts" },
  { label: "KYC Status", icon: CheckCircle, href: "/dashboard/seller/kyc", status: "verified" },
];

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-emerald text-primary-foreground safe-area-inset-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link to="/profile" className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-serif font-semibold">Seller Dashboard</span>
          </div>
          <Link to="/sell">
            <Button size="sm" className="bg-gold text-charcoal hover:bg-gold-light rounded-xl">
              <Plus className="w-4 h-4 mr-1" />
              Add Listing
            </Button>
          </Link>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-card border border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  {stat.change && (
                    <span className="text-xs text-emerald font-medium">{stat.change}</span>
                  )}
                </div>
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            );
          })}
        </section>

        {/* Quick Actions Menu */}
        <section className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {item.badge}
                    </span>
                  )}
                  {item.status === "verified" && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald/10 text-emerald text-xs font-medium">
                      Verified
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </section>

        {/* Recent Orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif font-semibold">Recent Orders</h2>
            <Link to="/dashboard/seller/orders" className="text-sm text-primary">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/dashboard/seller/orders/${order.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50"
              >
                <div>
                  <p className="font-medium text-sm">{order.coin}</p>
                  <p className="text-xs text-muted-foreground">{order.buyer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    ₹{order.amount.toLocaleString()}
                  </p>
                  <span
                    className={cn(
                      "text-xs font-medium capitalize",
                      order.status === "shipped" && "text-emerald",
                      order.status === "processing" && "text-accent",
                      order.status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Performance Card */}
        <section className="p-4 rounded-xl bg-gradient-card border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-gold" />
            <span className="font-semibold">This Month's Performance</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold">1,234</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </div>
            <div>
              <p className="text-lg font-semibold">8.2%</p>
              <p className="text-xs text-muted-foreground">Conv. Rate</p>
            </div>
            <div>
              <p className="text-lg font-semibold">4.9</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </div>
        </section>
      </main>

      <MobileNavBar />
    </div>
  );
}
