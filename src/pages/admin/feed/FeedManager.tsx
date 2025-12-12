
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, GripVertical, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FeedManager = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // New Item Form
    const [newItem, setNewItem] = useState({
        title: "",
        subtitle: "",
        type: "featured_coin", // default
        image_url: "",
        priority: 0,
        reference_id: ""
    });

    const fetchFeed = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('home_feed_items')
            .select('*')
            .order('priority', { ascending: false }); // High priority first

        if (error) {
            console.error('Error fetching feed:', error);
            toast.error("Failed to load feed items");
        } else {
            setItems(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleCreateItem = async () => {
        if (!newItem.title) {
            toast.error("Title is required");
            return;
        }

        const { error } = await supabase.from('home_feed_items').insert([{
            ...newItem,
            type: newItem.type as "featured_coin" | "expert_promo" | "seasonal_offer" | "educational",
            is_visible: true
        }]);

        if (error) {
            toast.error("Failed to create item");
        } else {
            toast.success("Feed item created");
            setNewItem({ title: "", subtitle: "", type: "featured_coin", image_url: "", priority: 0, reference_id: "" });
            fetchFeed();
        }
    };

    const toggleVisibility = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase.from('home_feed_items').update({ is_visible: !currentStatus }).eq('id', id);
        if (error) {
            toast.error("Failed to update status");
        } else {
            fetchFeed();
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('home_feed_items').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete item");
        } else {
            toast.success("Item deleted");
            fetchFeed();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif text-admin-text font-bold">Home Feed & Promotions</h2>
                    <p className="text-gray-400 text-sm">Manage cards displayed on the user's home screen.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Form */}
                <Card className="bg-admin-surface border-admin-border lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-admin-gold flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Feed Card
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Card Type</Label>
                            <Select
                                value={newItem.type}
                                onValueChange={(val) => setNewItem({ ...newItem, type: val })}
                            >
                                <SelectTrigger className="bg-black/20 border-admin-border text-white">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-admin-surface border-admin-border text-white">
                                    <SelectItem value="featured_coin">Featured Coin</SelectItem>
                                    <SelectItem value="expert_promo">Expert Service Promo</SelectItem>
                                    <SelectItem value="seasonal_offer">Seasonal Offer</SelectItem>
                                    <SelectItem value="educational">Educational / Facts</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Title</Label>
                            <Input
                                placeholder="Summer Sale..."
                                className="bg-black/20 border-admin-border text-white"
                                value={newItem.title}
                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Subtitle / Description</Label>
                            <Input
                                placeholder="Get 50% off..."
                                className="bg-black/20 border-admin-border text-white"
                                value={newItem.subtitle}
                                onChange={(e) => setNewItem({ ...newItem, subtitle: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Image</Label>
                            <div className="flex gap-2 items-center">
                                {newItem.image_url && (
                                    <div className="w-10 h-10 rounded bg-black/40 overflow-hidden flex-shrink-0 border border-white/10">
                                        <img src={newItem.image_url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            setLoading(true);
                                            try {
                                                const { uploadImage } = await import('@/utils/uploadUtils');
                                                // Using 'misc' bucket for feed items
                                                const url = await uploadImage(file, 'misc');
                                                if (url) setNewItem({ ...newItem, image_url: url });
                                                else toast.error("Upload failed");
                                            } catch (err) {
                                                console.error(err);
                                                toast.error("Upload error");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="bg-black/20 border-admin-border text-white file:text-admin-gold file:bg-transparent file:border-0 file:mr-2 file:cursor-pointer"
                                    />
                                    <Input
                                        placeholder="Or paste URL..."
                                        className="bg-black/20 border-admin-border text-white text-xs"
                                        value={newItem.image_url}
                                        onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Priority (Higher = Top)</Label>
                            <Input
                                type="number"
                                className="bg-black/20 border-admin-border text-white"
                                value={newItem.priority}
                                onChange={(e) => setNewItem({ ...newItem, priority: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <Button
                            className="w-full bg-admin-gold text-black hover:bg-admin-gold2 font-medium"
                            onClick={handleCreateItem}
                        >
                            Publish to Feed
                        </Button>
                    </CardContent>
                </Card>

                {/* Feed List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-medium text-admin-text">Current Feed Order</h3>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading feed...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-admin-surface/30 rounded border border-dashed border-white/10">
                            Feed is empty.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 bg-admin-surface border border-admin-border p-4 rounded-lg group hover:border-admin-gold/30 transition-all">
                                    <div className="text-gray-500 cursor-move">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div className="w-16 h-16 rounded bg-black/40 overflow-hidden flex-shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">No Img</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                                item.type === 'featured_coin' ? 'bg-amber-500/20 text-amber-500' :
                                                    item.type === 'expert_promo' ? 'bg-blue-500/20 text-blue-500' :
                                                        'bg-gray-500/20 text-gray-400'
                                            )}>
                                                {item.type.replace('_', ' ')}
                                            </span>
                                            {!item.is_visible && (
                                                <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">HIDDEN</span>
                                            )}
                                        </div>
                                        <h4 className="text-white font-medium truncate">{item.title}</h4>
                                        <p className="text-gray-500 text-sm truncate">{item.subtitle}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-gray-400 hover:text-white"
                                            onClick={() => toggleVisibility(item.id, item.is_visible)}
                                        >
                                            {item.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedManager;
