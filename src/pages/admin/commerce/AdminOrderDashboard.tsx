
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Users, DollarSign, Filter, ChevronRight, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminOrderDashboard = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [stats, setStats] = useState({ total_orders: 0, pending: 0, revenue: 0 });

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                user:profiles(display_name, username),
                address:shipping_addresses(city, state)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Failed to fetch orders");
        } else {
            console.log("Orders:", data);
            setOrders(data || []);

            // Calculate stats
            const pending = (data || []).filter(o => o.status === 'pending' || o.status === 'processing').length;
            const revenue = (data || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
            setStats({
                total_orders: (data || []).length,
                pending,
                revenue
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success(`Order marked as ${newStatus}`);
            fetchOrders();
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/50",
            processing: "bg-blue-500/10 text-blue-500 border-blue-500/50",
            shipped: "bg-purple-500/10 text-purple-500 border-purple-500/50",
            delivered: "bg-green-500/10 text-green-500 border-green-500/50",
            cancelled: "bg-red-500/10 text-red-500 border-red-500/50",
        };
        return (
            <Badge variant="outline" className={`${styles[status] || "bg-gray-500/10 text-gray-500"} capitalize`}>
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-admin-text font-bold">Order Management</h2>
                    <p className="text-gray-400 text-sm">Track shipments and update order statuses.</p>
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 bg-black/20 border-admin-border text-white">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-admin-surface border-admin-border text-white">
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-admin-surface border-admin-border">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase">Total Revenue</p>
                            <p className="text-2xl font-bold text-admin-gold mt-1">₹{stats.revenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-admin-gold/10 p-3 rounded-full text-admin-gold">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-admin-surface border-admin-border">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase">Pending Actions</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.pending}</p>
                        </div>
                        <div className="bg-orange-500/10 p-3 rounded-full text-orange-500">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-admin-surface border-admin-border">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase">Total Orders</p>
                            <p className="text-2xl font-bold text-white mt-1">{stats.total_orders}</p>
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded-full text-blue-500">
                            <Package className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders Table */}
            <Card className="bg-admin-surface border-admin-border">
                <CardHeader>
                    <CardTitle className="text-white">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-black/20 rounded border border-dashed border-white/10">
                            No orders found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-black/40 text-xs uppercase font-medium text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3">Order ID</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 font-mono text-white">#{order.id.slice(0, 8)}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-white font-medium">{order.user?.display_name || "Unknown"}</div>
                                                <div className="text-xs">{order.address?.city}, {order.address?.state}</div>
                                            </td>
                                            <td className="px-4 py-3">{format(new Date(order.created_at), 'MMM d, yyyy')}</td>
                                            <td className="px-4 py-3 text-white font-bold">₹{order.total_amount}</td>
                                            <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                                            <td className="px-4 py-3 text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-admin-surface border-admin-border text-white">
                                                        <DialogHeader>
                                                            <DialogTitle>Update Order Status</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="text-sm space-y-2">
                                                                <p><span className="text-gray-500">Order ID:</span> {order.id}</p>
                                                                <p><span className="text-gray-500">Customer:</span> {order.user?.display_name}</p>
                                                                <p><span className="text-gray-500">Total:</span> ₹{order.total_amount}</p>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">Change Status</label>
                                                                <Select
                                                                    value={order.status}
                                                                    onValueChange={(val) => handleStatusUpdate(order.id, val)}
                                                                >
                                                                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-admin-surface border-admin-border text-white">
                                                                        <SelectItem value="pending">Pending</SelectItem>
                                                                        <SelectItem value="processing">Processing</SelectItem>
                                                                        <SelectItem value="shipped">Shipped</SelectItem>
                                                                        <SelectItem value="delivered">Delivered</SelectItem>
                                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminOrderDashboard;
