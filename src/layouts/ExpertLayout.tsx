import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, MessageCircle, ShieldCheck, Home } from "lucide-react";

const ExpertLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: MessageCircle, label: "Requests", path: "/expert/dashboard" },
    ];

    return (
        <div className="min-h-screen bg-admin-bg text-admin-text font-sans overflow-hidden flex flex-col">
            {/* Mobile Top Header */}
            <header className="h-16 border-b border-admin-border bg-admin-surface/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-admin-gold/20 p-2 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-admin-gold" />
                    </div>
                    <h1 className="text-xl font-serif text-admin-gold tracking-wide">Expert Dashboard</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-admin-gold/10 rounded-lg transition-colors"
                        title="Go Home"
                    >
                        <Home className="w-5 h-5 text-admin-gold" />
                    </button>
                    <button className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <X className="w-6 h-6 text-admin-text" /> : <Menu className="w-6 h-6 text-admin-text" />}
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
                <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-admin-surface border-t border-admin-border h-20 px-4 pb-2 pt-2 z-50 shadow-gold">
                <div className="flex justify-center items-center h-full">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsSidebarOpen(false);
                                }}
                                className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all ${
                                    isActive
                                        ? "bg-admin-gold/20 text-admin-gold"
                                        : "text-gray-400 hover:text-admin-gold"
                                }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default ExpertLayout;
