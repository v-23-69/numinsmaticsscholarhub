
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImages } from "@/utils/uploadUtils";

const MobileSell = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [year, setYear] = useState("");
    const [metal, setMetal] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        // Fetch categories for the select dropdown
        const fetchCategories = async () => {
            const { data } = await supabase.from('coin_categories').select('id, name, slug');
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            // Create previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!title || !price || images.length === 0) {
            toast({
                title: "Missing Information",
                description: "Please provide a title, price, and at least one image.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            // 1. Upload Images
            const imageUrls = await uploadImages(images, 'coins');

            if (imageUrls.length === 0) {
                throw new Error("Failed to upload images");
            }

            // 2. Create Listing
            const { data: listingData, error: listingError } = await supabase
                .from('coin_listings')
                .insert({
                    seller_id: user.id,
                    title,
                    description,
                    price: parseFloat(price),
                    year: year ? parseInt(year) : null,
                    metal_type: metal || null,
                    // If no category selected, use null or handle logic
                    category_id: category || null,
                    status: 'active' // Default to active for now
                })
                .select()
                .single();

            if (listingError) throw listingError;

            // 3. Create Image Records
            const imageRecords = imageUrls.map((url, index) => ({
                coin_id: listingData.id,
                url,
                display_order: index
            }));

            const { error: imagesError } = await supabase
                .from('coin_images')
                .insert(imageRecords);

            if (imagesError) throw imagesError;

            toast({
                title: "Listing Created!",
                description: "Your coin is now live on the marketplace.",
            });

            navigate('/dashboard/seller'); // Return to dashboard

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.message || "Failed to create listing",
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border/40 safe-area-inset-top">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <span className="font-serif font-semibold">New Listing</span>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">

                {/* Image Upload Section */}
                <div className="space-y-3">
                    <Label>Photos</Label>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        <div className="relative flex-shrink-0 w-24 h-24 border-2 border-dashed border-input rounded-xl flex flex-col items-center justify-center bg-secondary/50 cursor-pointer hover:bg-secondary/80 transition-colors">
                            <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Add</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImageSelect}
                            />
                        </div>
                        {imagePreviews.map((src, idx) => (
                            <div key={idx} className="relative flex-shrink-0 w-24 h-24 border border-border rounded-xl overflow-hidden bg-black">
                                <img src={src} alt="" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            placeholder="e.g. Rare Mughal Mohur 1620"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Price (₹)</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Describe the condition, history, etc."
                            className="min-h-[120px]"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Year</Label>
                            <Input
                                type="number"
                                placeholder="YYYY"
                                value={year}
                                onChange={e => setYear(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Metal</Label>
                            <Select value={metal} onValueChange={setMetal}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Gold">Gold</SelectItem>
                                    <SelectItem value="Silver">Silver</SelectItem>
                                    <SelectItem value="Copper">Copper</SelectItem>
                                    <SelectItem value="Nickel">Nickel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 text-lg font-semibold bg-gold hover:bg-gold-light text-charcoal rounded-xl"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post Listing"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default MobileSell;
