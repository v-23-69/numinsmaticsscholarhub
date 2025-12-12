
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Trash2, Search, Trophy, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const FeaturedCoinsManager = () => {
    const [featured, setFeatured] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Search & Add State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [newConfig, setNewConfig] = useState({
        coin_id: "",
        priority: 0,
        promo_text: "Editor's Pick",
        is_active: true
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchFeatured = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('featured_coin_configs')
            .select(`
                *,
                coin:coin_listings(
                   id, title, price, currency,
                   images:coin_images(url)
                )
            `)
            .order('priority', { ascending: false });

        if (error) {
            toast.error("Failed to fetch featured coins");
        } else {
            console.log("Featured data:", data);
            setFeatured(data || []);
        }
        setLoading(false);
    };

    const searchCoins = async (query: string) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
        const { data } = await supabase
            .from('coin_listings')
            .select('id, title, price, currency')
            .ilike('title', `%${query}%`)
            .limit(10);

        setSearchResults(data || []);
    };

    useEffect(() => {
        fetchFeatured();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => searchCoins(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAdd = async () => {
        if (!newConfig.coin_id) {
            toast.error("Please select a coin");
            return;
        }

        const { error } = await supabase
            .from('featured_coin_configs')
            .insert([newConfig]);

        if (error) {
            if (error.code === '23505') { // Unique violation
                toast.error("This coin is already featured!");
            } else {
                toast.error("Failed to add featured coin");
            }
        } else {
            toast.success("Coin featured successfully!");
            setIsDialogOpen(false);
            setNewConfig({ coin_id: "", priority: 0, promo_text: "Editor's Pick", is_active: true });
            setSearchQuery("");
            fetchFeatured();
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('featured_coin_configs')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error("Failed to remove coin");
        } else {
            toast.success("Coin removed from featured");
            fetchFeatured();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-admin-text font-bold">Featured Coins</h2>
                    <p className="text-gray-400 text-sm">Curate high-value or rare coins for the spotlight.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-admin-gold text-black hover:bg-admin-gold2">
                            <Plus className="w-4 h-4 mr-2" /> Add Featured Coin
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-admin-surface border-admin-border text-white">
                        <DialogHeader>
                            <DialogTitle>Feature a Coin</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Search Coin</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search by title..."
                                        className="pl-9 bg-black/20 border-white/10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="border border-white/10 rounded-md max-h-40 overflow-y-auto bg-black/40 p-1">
                                        {searchResults.map(coin => (
                                            <div
                                                key={coin.id}
                                                className={`p-2 text-sm cursor-pointer rounded hover:bg-admin-gold/20 flex justify-between ${newConfig.coin_id === coin.id ? 'bg-admin-gold/10 text-admin-gold' : 'text-gray-300'}`}
                                                onClick={() => setNewConfig({ ...newConfig, coin_id: coin.id })}
                                            >
                                                <span>{coin.title}</span>
                                                <span>{coin.currency} {coin.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Promo Badge Text</Label>
                                <Input
                                    className="bg-black/20 border-white/10"
                                    value={newConfig.promo_text}
                                    onChange={(e) => setNewConfig({ ...newConfig, promo_text: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Priority Score (Higher shows first)</Label>
                                <Input
                                    type="number"
                                    className="bg-black/20 border-white/10"
                                    value={newConfig.priority}
                                    onChange={(e) => setNewConfig({ ...newConfig, priority: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <Button onClick={handleAdd} className="w-full bg-admin-gold text-black mt-2">
                                Confirm Feature
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading featured coins...</div>
            ) : featured.length === 0 ? (
                <div className="text-center py-16 bg-admin-surface/30 rounded border border-dashed border-white/10 text-gray-500">
                    No coins are currently featured.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featured.map((item) => {
                        const coin = item.coin; // Joined data
                        const imageUrl = coin?.images?.[0]?.url || "https://placehold.co/400x400/222/888?text=No+Image";

                        return (
                            <Card key={item.id} className="bg-admin-surface border-admin-gold/30 hover:border-admin-gold transition-all group overflow-hidden relative">
                                {/* Banner Overlay */}
                                <div className="absolute top-0 right-0 bg-admin-gold text-black text-[10px] font-bold px-2 py-1 z-10">
                                    {item.promo_text}
                                </div>
                                <div className="absolute top-0 left-0 bg-black/60 text-white text-[10px] px-2 py-1 z-10 backdrop-blur-md border-b border-r border-white/10">
                                    Priority: {item.priority}
                                </div>

                                <div className="h-40 w-full overflow-hidden bg-black/40">
                                    <img src={imageUrl} alt={coin?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>

                                <CardContent className="p-4 relative">
                                    <h3 className="text-admin-gold font-serif font-medium truncate text-lg pr-6">{coin?.title || "Unknown Coin"}</h3>
                                    <p className="text-white font-bold mb-2">{coin?.currency} {coin?.price}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-400 mt-4">
                                        <span>Added: {format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20 px-2"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" /> Remove
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default FeaturedCoinsManager;
