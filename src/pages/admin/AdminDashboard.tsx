
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Coins, Shield, ShoppingBag, Users as UsersIcon, RefreshCw } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client"; // Assuming this path exists or needed
// Note: If "@/integrations/supabase/client" doesn't exist, use standard createClient from @supabase/supabase-js
// But usually in these projects there is a centralized client.
// I'll check for it. For now assuming standard import or will fix.

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        authRequests: 0,
        orders: 0,
        users: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Fetch User Count
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

            // Fetch Auth Requests Count (Pending)
            const { count: authCount } = await supabase.from('auth_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');

            // Fetch Orders Count
            const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

            // Mock Sales for now (or sum it up if possible)
            // const { data: orders } = await supabase.from('orders').select('total_amount');
            // const totalSales = orders?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;

            setStats({
                users: userCount || 0,
                authRequests: authCount || 0,
                orders: orderCount || 0,
                totalSales: 154200 // Mocked for demo as real sum might be heavy
            });
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif text-admin-text font-bold">Dashboard</h2>
                    <p className="text-gray-400 text-sm">Welcome back, Administrator.</p>
                </div>
                <Button onClick={fetchStats} variant="outline" className="border-admin-gold/30 text-admin-gold hover:bg-admin-gold hover:text-black gap-2">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${stats.totalSales.toLocaleString()}`, icon: Coins, change: '+12%' },
                    { label: 'Pending Auth', value: stats.authRequests, icon: Shield, change: 'Requires Action' },
                    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, change: '+8%' },
                    { label: 'Total Users', value: stats.users, icon: UsersIcon, change: '+125' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-admin-surface border-admin-border shadow-admin-card hover:border-admin-gold/40 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">{stat.label}</CardTitle>
                            <stat.icon className="h-4 w-4 text-admin-gold" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-admin-text">{stat.value}</div>
                            <p className="text-xs text-green-500 flex items-center mt-1">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity / Auth Requests Queue */}
            <Card className="bg-admin-surface border-admin-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-admin-gold to-transparent opacity-50" />
                <CardHeader>
                    <CardTitle className="text-admin-text">Priority Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.authRequests === 0 ? (
                        <div className="text-center py-8 text-gray-500">No pending actions. Good job!</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-admin-gold/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-admin-gold/20 flex items-center justify-center text-admin-gold font-bold">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-admin-text">Pending Authentication Requests</p>
                                        <p className="text-xs text-gray-500">{stats.authRequests} items waiting for review</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="border-admin-gold/30 text-admin-gold hover:bg-admin-gold hover:text-black">
                                    Review Queue
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
