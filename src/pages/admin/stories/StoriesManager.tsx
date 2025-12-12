
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Eye, Calendar, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StoriesManager = () => {
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        media_url: "",
        caption: "",
        cta_link: "",
        cta_text: "Learn More",
        media_type: "image"
    });

    const fetchStories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('admin_stories')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching stories:', error);
            toast.error("Failed to load stories");
        } else {
            setStories(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleCreateStory = async () => {
        if (!newItem.media_url) {
            toast.error("Please provide a media URL");
            return;
        }

        setUploading(true);
        const { error } = await supabase.from('admin_stories').insert([{
            ...newItem,
            media_type: newItem.media_type as "image" | "video",
            is_active: true
        }]);

        if (error) {
            toast.error("Failed to create story: " + error.message);
        } else {
            toast.success("Story created successfully!");
            setNewItem({ media_url: "", caption: "", cta_link: "", cta_text: "Learn More", media_type: "image" });
            fetchStories();
        }
        setUploading(false);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('admin_stories').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete story");
        } else {
            toast.success("Story deleted");
            fetchStories();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif text-admin-text font-bold">Stories Manager</h2>
                    <p className="text-gray-400 text-sm">Create and manage admin stories.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Story Form */}
                <Card className="bg-admin-surface border-admin-border lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-admin-gold flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add New Story
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Media (Image/Video)</Label>

                            <div className="flex gap-4 items-start">
                                {/* Preview */}
                                <div className="w-24 h-24 bg-black/40 rounded border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {newItem.media_url ? (
                                        newItem.media_type === 'video' ? (
                                            <video src={newItem.media_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={newItem.media_url} alt="" className="w-full h-full object-cover" />
                                        )
                                    ) : (
                                        <div className="text-gray-600 text-xs text-center px-1">No Media</div>
                                    )}
                                </div>

                                {/* Inputs */}
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <Label className="text-xs text-gray-500 mb-1 block">Upload File</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="file"
                                                accept="image/*,video/*"
                                                disabled={uploading}
                                                className="bg-black/20 border-admin-border text-white file:text-admin-gold file:bg-transparent file:border-0 file:cursor-pointer"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    setUploading(true);
                                                    const type = file.type.startsWith('video') ? 'video' : 'image';
                                                    setNewItem(prev => ({ ...prev, media_type: type }));

                                                    try {
                                                        const { uploadImage } = await import('@/utils/uploadUtils');
                                                        const url = await uploadImage(file, 'stories');
                                                        if (url) setNewItem(prev => ({ ...prev, media_url: url }));
                                                        else toast.error("Upload failed");
                                                    } catch (err) {
                                                        console.error(err);
                                                        toast.error("Upload error");
                                                    } finally {
                                                        setUploading(false);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="h-px bg-white/10 flex-1" />
                                        <span className="text-[10px] text-gray-500 uppercase">Or URL</span>
                                        <div className="h-px bg-white/10 flex-1" />
                                    </div>

                                    <Input
                                        placeholder="https://example.com/image.jpg"
                                        className="bg-black/20 border-admin-border text-white text-xs h-8"
                                        value={newItem.media_url}
                                        onChange={(e) => setNewItem({ ...newItem, media_url: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Caption</Label>
                            <Textarea
                                placeholder="Write a catchy caption..."
                                className="bg-black/20 border-admin-border text-white"
                                value={newItem.caption}
                                onChange={(e) => setNewItem({ ...newItem, caption: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Call to Action Link</Label>
                            <Input
                                placeholder="/marketplace/coin/123"
                                className="bg-black/20 border-admin-border text-white"
                                value={newItem.cta_link}
                                onChange={(e) => setNewItem({ ...newItem, cta_link: e.target.value })}
                            />
                        </div>

                        <Button
                            className="w-full bg-admin-gold text-black hover:bg-admin-gold2 font-medium"
                            onClick={handleCreateStory}
                            disabled={uploading}
                        >
                            {uploading ? "Publishing..." : "Publish Story"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Stories List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-medium text-admin-text">Active Admin Stories</h3>
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 animate-pulse">Loading stories...</div>
                    ) : stories.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-admin-surface/50 rounded-lg border border-dashed border-white/10">
                            No stories active. Create one to engage users!
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {stories.map((story) => (
                                <div key={story.id} className="group relative aspect-[9/16] bg-black rounded-lg overflow-hidden border border-admin-border hover:border-admin-gold transition-all shadow-md">
                                    <img
                                        src={story.media_url}
                                        alt="Story"
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        onError={(e) => (e.currentTarget.src = "https://placehold.co/400x800/111/444?text=Invalid+Image")}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="text-xs text-white line-clamp-2 mb-2">{story.caption || "No caption"}</p>
                                        <div className="flex items-center justify-between text-xs text-admin-gold">
                                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {story.views_count}</span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                onClick={() => handleDelete(story.id)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-2 right-2 bg-admin-gold/90 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        ACTIVE
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

export default StoriesManager;
