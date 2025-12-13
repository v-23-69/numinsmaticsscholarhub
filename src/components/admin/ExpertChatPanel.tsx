import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Check, CheckCheck, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    is_read: boolean;
}

interface ExpertChatPanelProps {
    requestId: string;
    threadId: string | null;
    userId: string;
    userName: string;
    userAvatar?: string;
    images: string[];
    onClose: () => void;
    onSessionEnd: () => void;
}

export const ExpertChatPanel: React.FC<ExpertChatPanelProps> = ({
    requestId,
    threadId,
    userId,
    userName,
    userAvatar,
    images,
    onClose,
    onSessionEnd
}) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [typingUserId, setTypingUserId] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [showImages, setShowImages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!threadId) {
            setLoading(false);
            return;
        }

        fetchMessages();
        subscribeToMessages();
        subscribeToThread();

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [threadId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUserId]);

    const fetchMessages = async () => {
        if (!threadId) return;
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true });
        if (data) setMessages(data);
        setLoading(false);
    };

    const subscribeToMessages = () => {
        if (!threadId) return;
        const channel = supabase
            .channel(`expert-messages:${threadId}`)
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `thread_id=eq.${threadId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
            .subscribe();
        return channel;
    };

    const subscribeToThread = () => {
        if (!threadId) return;
        const channel = supabase
            .channel(`expert-thread:${threadId}`)
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'threads',
                    filter: `id=eq.${threadId}`
                },
                (payload) => {
                    const updated = payload.new as any;
                    setIsActive(updated.is_active || false);
                    if (updated.typing_user_id && updated.typing_user_id !== user?.id) {
                        setTypingUserId(updated.typing_user_id);
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => setTypingUserId(null), 3000);
                    } else {
                        setTypingUserId(null);
                    }
                }
            )
            .subscribe();
        return channel;
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !threadId || !isActive || sending) return;

        const tempMsg = newMessage;
        setNewMessage("");
        setSending(true);

        const { error } = await supabase.from('messages').insert({
            thread_id: threadId,
            sender_id: user?.id,
            content: tempMsg
        });

        if (error) {
            toast.error("Failed to send message");
            setNewMessage(tempMsg);
        } else {
            await supabase
                .from('threads')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', threadId);
        }
        setSending(false);
    };

    const handleEndSession = async () => {
        if (!threadId) return;
        if (!confirm("Are you sure you want to end this session? The user will not be able to chat after this.")) return;

        const { error } = await supabase.rpc('end_expert_session', { thread_id_param: threadId });
        if (error) {
            toast.error("Failed to end session");
        } else {
            toast.success("Session ended successfully");
            setIsActive(false);
            onSessionEnd();
        }
    };

    if (!threadId) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-admin-surface border border-admin-gold/30 rounded-xl p-6 max-w-md w-full text-center">
                    <p className="text-gray-400 mb-4">Chat thread not created yet. Waiting for assignment...</p>
                    <Button onClick={onClose} variant="outline" className="border-admin-gold/30 text-admin-gold">
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-admin-surface border-2 border-admin-gold/30 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-admin-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-admin-gold/30 overflow-hidden">
                            <img src={userAvatar || "https://i.pravatar.cc/150"} alt={userName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-admin-text">{userName}</h3>
                            <p className="text-xs text-gray-400">Request #{requestId.slice(0, 8)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowImages(!showImages)}
                            className="border-admin-gold/30 text-admin-gold"
                        >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Photos
                        </Button>
                        {isActive && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEndSession}
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                                End Session
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Images Panel */}
                <AnimatePresence>
                    {showImages && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="border-b border-admin-border overflow-hidden"
                        >
                            <div className="p-4 grid grid-cols-2 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-admin-gold/20">
                                        <img src={img} alt={`Coin ${idx + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                                            {idx === 0 ? "Front" : "Back"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-admin-gold" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <p>No messages yet. Start the conversation...</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === user?.id;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn("flex", isMe ? "justify-end" : "justify-start")}
                                    >
                                        <div className={cn(
                                            "max-w-[70%] rounded-xl px-4 py-2 text-sm",
                                            isMe
                                                ? "bg-admin-gold/20 text-admin-text border border-admin-gold/30"
                                                : "bg-white/5 text-gray-200 border border-white/10"
                                        )}>
                                            <p>{msg.content}</p>
                                            <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                                                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isMe && (msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <AnimatePresence>
                                {typingUserId && typingUserId !== user?.id && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-white/5 rounded-xl px-4 py-2">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-admin-gold rounded-full animate-bounce" />
                                                <div className="w-2 h-2 bg-admin-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-admin-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {isActive ? (
                    <div className="p-4 border-t border-admin-border flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder="Type your message..."
                            disabled={sending}
                            className="bg-admin-bg border-admin-border"
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || sending}
                            className="bg-admin-gold text-black hover:bg-admin-gold2"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                ) : (
                    <div className="p-4 border-t border-admin-border text-center text-gray-400 text-sm">
                        Session has been ended
                    </div>
                )}
            </motion.div>
        </div>
    );
};

