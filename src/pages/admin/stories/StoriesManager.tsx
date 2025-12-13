
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Eye, Calendar, Upload, Camera, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImage } from "@/utils/uploadUtils";

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
        media_type: "image" as "image" | "video"
    });
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [showSourceSelector, setShowSourceSelector] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileSelect = async (file: File) => {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setPreviewFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setNewItem(prev => ({ ...prev, media_type: type }));
        setShowSourceSelector(false);
    };

    const handleSourceSelect = (source: "camera" | "gallery") => {
        if (source === "camera" && cameraInputRef.current) {
            cameraInputRef.current.setAttribute("capture", "environment");
            cameraInputRef.current.click();
        } else if (source === "gallery" && fileInputRef.current) {
            fileInputRef.current.removeAttribute("capture");
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        // Reset input
        if (e.target) e.target.value = '';
    };

    const handleCreateStory = async () => {
        if (!previewFile && !newItem.media_url) {
            toast.error("Please upload a media file");
            return;
        }

        setUploading(true);
        try {
            let mediaUrl = newItem.media_url;

            // Upload file if selected
            if (previewFile) {
                mediaUrl = await uploadImage(previewFile, 'stories');
                if (!mediaUrl) {
                    toast.error("Failed to upload media");
                    setUploading(false);
                    return;
                }
            }

            const { error } = await supabase.from('admin_stories').insert([{
                media_url: mediaUrl,
                media_type: newItem.media_type,
                caption: newItem.caption,
                cta_link: newItem.cta_link,
                cta_text: newItem.cta_text,
                is_active: true
            }]);

            if (error) {
                toast.error("Failed to create story: " + error.message);
            } else {
                toast.success("Story created successfully!");
                setNewItem({ media_url: "", caption: "", cta_link: "", cta_text: "Learn More", media_type: "image" });
                setPreviewFile(null);
                setPreviewUrl("");
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                fetchStories();
            }
        } catch (error: any) {
            toast.error("Error: " + error.message);
        } finally {
            setUploading(false);
        }
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
                        {/* Hidden File Inputs */}
                        <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            ref={cameraInputRef}
                            onChange={handleFileChange}
                        />

                        <div className="space-y-2">
                            <Label className="text-gray-300">Media (Image/Video)</Label>

                            <div className="flex gap-4 items-start">
                                {/* Preview */}
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative w-32 h-32 bg-black/40 rounded-lg border-2 border-gold/30 flex items-center justify-center overflow-hidden flex-shrink-0 group"
                                >
                                    {previewUrl ? (
                                        <>
                                            {newItem.media_type === 'video' ? (
                                                <video src={previewUrl} className="w-full h-full object-cover" controls />
                                            ) : (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            )}
                                            <button
                                                onClick={() => {
                                                    setPreviewFile(null);
                                                    setPreviewUrl("");
                                                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                                                }}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-gray-600 text-xs text-center px-2">No Media</div>
                                    )}
                                </motion.div>

                                {/* Upload Buttons */}
                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowSourceSelector(true)}
                                            disabled={uploading}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gold/40 hover:border-gold bg-gold/5 hover:bg-gold/10 transition-all disabled:opacity-50"
                                        >
                                            <Camera className="w-6 h-6 text-gold" />
                                            <span className="text-xs font-medium text-gold">Camera</span>
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSourceSelect("gallery")}
                                            disabled={uploading}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gold/40 hover:border-gold bg-gold/5 hover:bg-gold/10 transition-all disabled:opacity-50"
                                        >
                                            <ImageIcon className="w-6 h-6 text-gold" />
                                            <span className="text-xs font-medium text-gold">Gallery</span>
                                        </motion.button>
                                    </div>
                                    {previewFile && (
                                        <div className="text-xs text-gray-400">
                                            Selected: {previewFile.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Source Selector Modal */}
                        <AnimatePresence>
                            {showSourceSelector && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                                    onClick={() => setShowSourceSelector(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                        className="bg-admin-surface border-2 border-gold/30 rounded-2xl p-6 max-w-sm w-full"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <h3 className="text-lg font-serif font-semibold text-admin-gold mb-4 text-center">
                                            Select Source
                                        </h3>
                                        <div className="space-y-3">
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleSourceSelect("camera")}
                                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gold/30 hover:bg-gold/10 transition-all"
                                            >
                                                <Camera className="w-6 h-6 text-gold" />
                                                <span className="font-medium">Take Photo/Video</span>
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleSourceSelect("gallery")}
                                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gold/30 hover:bg-gold/10 transition-all"
                                            >
                                                <ImageIcon className="w-6 h-6 text-gold" />
                                                <span className="font-medium">Choose from Gallery</span>
                                            </motion.button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setShowSourceSelector(false)}
                                                className="w-full mt-2"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

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

                        <motion.div whileTap={{ scale: 0.98 }}>
                            <Button
                                className="w-full bg-admin-gold text-black hover:bg-admin-gold2 font-medium"
                                onClick={handleCreateStory}
                                disabled={uploading || (!previewFile && !newItem.media_url)}
                            >
                                {uploading ? "Publishing..." : "Publish Story"}
                            </Button>
                        </motion.div>
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
