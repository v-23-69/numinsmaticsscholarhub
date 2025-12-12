
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Settings,
    Star,
    ShieldCheck,
    Smartphone,
    Menu,
    Trophy,
    Percent,
    ShoppingCart as OrderIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: "Home", path: "/admin" },
        { icon: Star, label: "Stories", path: "/admin/stories" },
        { icon: Star, label: "Feed", path: "/admin/feed" },
        { icon: Trophy, label: "Featured", path: "/admin/featured" },
        { icon: OrderIcon, label: "Orders", path: "/admin/orders" },
        { icon: Percent, label: "Offers", path: "/admin/discounts" },
        { icon: ShieldCheck, label: "Experts", path: "/admin/experts" },
        { icon: ShoppingBag, label: "Shopify", path: "/admin/shopify" },
        { icon: Users, label: "Users", path: "/admin/users" },
        { icon: Settings, label: "Settings", path: "/admin/settings" },
    ];

    return (
        <div className="min-h-screen bg-admin-bg text-admin-text font-sans overflow-hidden flex flex-col">
            {/* Mobile Top Header */}
            <header className="h-16 border-b border-admin-border bg-admin-surface/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-admin-gold/20 p-2 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-admin-gold" />
                    </div>
                    <h1 className="text-xl font-serif text-admin-gold tracking-wide">NSH Admin</h1>
                </div>
                <button className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <Menu className="w-6 h-6 text-admin-text" />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-24 md:pb-0 md:pl-64">
                <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-admin-surface border-t border-admin-border h-20 px-4 pb-2 pt-2 z-50 shadow-gold">
                <div className="flex justify-between items-center h-full">
                    {navItems.slice(0, 5).map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 transition-all duration-300 w-16",
                                    isActive ? "text-admin-gold -translate-y-1" : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                <item.icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]")} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </nav>

            {/* Desktop Sidebar (Optional but good for scalability) */}
            <aside className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-admin-surface border-r border-admin-border p-4">
                <div className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (location.pathname !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                                    isActive
                                        ? "bg-admin-gold/10 text-admin-gold border border-admin-gold/20"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive && "animate-pulse-gold")} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-admin-gold shadow-glow" />}
                            </button>
                        )
                    })}
                </div>
            </aside>
        </div>
    );
};

export default AdminLayout;
