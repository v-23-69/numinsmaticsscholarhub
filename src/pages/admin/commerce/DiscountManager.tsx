
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar, Tag, Percent, Users, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

const DiscountManager = () => {
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [newDiscount, setNewDiscount] = useState({
        code: "",
        percentage: 10,
        min_order_amount: 0,
        usage_limit: 100,
        is_active: true
    });

    const fetchDiscounts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('discounts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Failed to fetch discounts");
        } else {
            setDiscounts(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const handleCreate = async () => {
        if (!newDiscount.code) {
            toast.error("Code is required");
            return;
        }

        const { error } = await supabase
            .from('discounts')
            .insert([newDiscount]);

        if (error) {
            toast.error("Failed to create discount");
        } else {
            toast.success("Discount created successfully");
            setIsDialogOpen(false);
            setNewDiscount({
                code: "",
                percentage: 10,
                min_order_amount: 0,
                usage_limit: 100,
                is_active: true
            });
            fetchDiscounts();
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('discounts')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            toast.error("Update failed");
        } else {
            toast.success(currentStatus ? "Discount deactivated" : "Discount activated");
            fetchDiscounts();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this discount?")) return;

        const { error } = await supabase
            .from('discounts')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error("Delete failed");
        } else {
            toast.success("Discount deleted");
            fetchDiscounts();
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied!");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-admin-text font-bold">Discounts & Offers</h2>
                    <p className="text-gray-400 text-sm">Create promo codes and manage sales campaigns.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-admin-gold text-black hover:bg-admin-gold2">
                            <Plus className="w-4 h-4 mr-2" /> Create Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-admin-surface border-admin-border text-white">
                        <DialogHeader>
                            <DialogTitle>New Discount Code</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Coupon Code (e.g., BLACKFRIDAY)</Label>
                                <Input
                                    className="bg-black/20 border-white/10 uppercase placeholder:normal-case"
                                    placeholder="Enter code..."
                                    value={newDiscount.code}
                                    onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Discount %</Label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            type="number"
                                            className="pl-9 bg-black/20 border-white/10"
                                            value={newDiscount.percentage}
                                            onChange={(e) => setNewDiscount({ ...newDiscount, percentage: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Min Order (₹)</Label>
                                    <Input
                                        type="number"
                                        className="bg-black/20 border-white/10"
                                        value={newDiscount.min_order_amount}
                                        onChange={(e) => setNewDiscount({ ...newDiscount, min_order_amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Usage Limit</Label>
                                <Input
                                    type="number"
                                    className="bg-black/20 border-white/10"
                                    value={newDiscount.usage_limit}
                                    onChange={(e) => setNewDiscount({ ...newDiscount, usage_limit: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Label>Active Immediately</Label>
                                <Switch
                                    checked={newDiscount.is_active}
                                    onCheckedChange={(c) => setNewDiscount({ ...newDiscount, is_active: c })}
                                />
                            </div>

                            <Button onClick={handleCreate} className="w-full bg-admin-gold text-black mt-4">
                                Create Discount
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading offers...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {discounts.map((item) => (
                        <Card key={item.id} className="bg-admin-surface border-admin-border hover:border-admin-gold/50 transition-all relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Tag className="w-24 h-24" />
                            </div>

                            <CardContent className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div
                                        className="bg-black/40 border border-white/10 rounded px-3 py-1 flex items-center gap-2 cursor-pointer hover:bg-black/60 active:scale-95 transition-all"
                                        onClick={() => copyCode(item.code)}
                                    >
                                        <span className="font-mono font-bold text-admin-gold tracking-widest text-lg">{item.code}</span>
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </div>
                                    <Switch
                                        checked={item.is_active}
                                        onCheckedChange={() => toggleStatus(item.id, item.is_active)}
                                    />
                                </div>

                                <div className="space-y-1 mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-white">{item.percentage}%</span>
                                        <span className="text-gray-400">OFF</span>
                                    </div>
                                    <p className="text-gray-500 text-sm">Min. Order: ₹{item.min_order_amount}</p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Users className="w-3 h-3" />
                                        <span>{item.used_count || 0} / {item.usage_limit || '∞'} used</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {!loading && discounts.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-admin-surface/30 rounded border border-dashed border-white/10">
                            No active discounts found. Create one to get started.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DiscountManager;
