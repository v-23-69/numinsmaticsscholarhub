import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Send, Paperclip, User, X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { initCometChat, loginCometChat, createCometChatUser } from "@/lib/cometchat";
import { sendTextMessage, fetchMessages, createMessageListener, ChatMessage } from "@/lib/cometchat-messages";
import { SessionTimer } from "@/components/chat/SessionTimer";
import { ProfileView } from "@/components/chat/ProfileView";
import { ImageGallery } from "@/components/chat/ImageGallery";

export default function ExpertChatView() {
    const { requestId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userUID, setUserUID] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("User");
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showImages, setShowImages] = useState(false);
    const [requestImages, setRequestImages] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user || !requestId) return;

        let removeListener: (() => void) | null = null;

        const setupCometChat = async () => {
            try {
                setLoading(true);

                // 1. Fetch auth request details with retry logic
                let reqData: any = null;
                let retries = 3;
                
                while (retries > 0) {
                    const { data, error: reqError } = await supabase
                        .from('auth_requests')
                        .select('user_id, assigned_expert_id, paid')
                        .eq('id', requestId)
                        .single();

                    if (reqError || !data) {
                        if (retries === 1) {
                            toast.error("Authentication request not found");
                            // Navigate back based on current route
                            if (window.location.pathname.includes('/expert/')) {
                                navigate('/expert/dashboard');
                            } else {
                                navigate('/admin/expert-auth');
                            }
                            return;
                        }
                        await new Promise(resolve => setTimeout(resolve, 500));
                        retries--;
                        continue;
                    }

                    reqData = data;
                    
                    const assignedExpertId = String(reqData.assigned_expert_id || '');
                    const currentUserId = String(user.id || '');
                    
                    if (assignedExpertId === currentUserId) {
                        break;
                    }
                    
                    if (retries > 1) {
                        console.log(`Assignment not found, retrying... (${retries - 1} attempts left)`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        retries--;
                    } else {
                        console.error("Assignment mismatch:", { assignedExpertId, currentUserId, requestId });
                        toast.error("You are not assigned to this request. Please accept the request first.");
                        // Navigate back based on current route
                        if (window.location.pathname.includes('/expert/')) {
                            navigate('/expert/dashboard');
                        } else {
                            navigate('/admin/expert-auth');
                        }
                        return;
                    }
                }

                // 2. Get user details
                const { data: userProfile, error: userError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', reqData.user_id)
                    .maybeSingle();

                if (userError) {
                    console.warn("Error fetching user profile (non-blocking):", userError);
                }

                if (userProfile) {
                    setUserName(userProfile.display_name || userProfile.username || 'User');
                    setUserAvatar(userProfile.avatar_url || null);
                    setUserProfile(userProfile);
                    setUserUID(reqData.user_id);
                } else {
                    setUserUID(reqData.user_id);
                }

                // Store images for viewing
                if (reqData.images && Array.isArray(reqData.images)) {
                    setRequestImages(reqData.images);
                }

                // Set session start time
                const startTime = reqData.session_started_at 
                    ? new Date(reqData.session_started_at) 
                    : new Date(reqData.created_at);
                setSessionStartTime(startTime);

                // 3. Initialize CometChat SDK
                await initCometChat();

                // 4. Ensure current expert exists in CometChat
                const expertName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Expert';
                await createCometChatUser(user.id, expertName);

                // 5. Ensure user exists in CometChat
                if (userProfile) {
                    const name = userProfile.display_name || userProfile.username || 'User';
                    await createCometChatUser(reqData.user_id, name);
                }

                // 6. Login expert to CometChat
                await loginCometChat(user.id);

                // 7. Fetch previous messages
                const previousMessages = await fetchMessages(reqData.user_id, 50);
                setMessages(previousMessages.reverse());

                // 8. Set up message listener
                removeListener = createMessageListener(
                    `expert-chat-${requestId}`,
                    (message) => {
                        setMessages((prev) => [...prev, message]);
                    }
                );

            } catch (error: any) {
                console.error("CometChat setup error:", error);
                toast.error(error.message || "Failed to initialize chat");
            } finally {
                setLoading(false);
            }
        };

        setupCometChat();

        // Cleanup listener on unmount
        return () => {
            if (removeListener) {
                removeListener();
            }
        };
    }, [user, requestId, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!messageText.trim() || !userUID || sending) return;

        setSending(true);
        try {
            const sentMessage = await sendTextMessage(userUID, messageText.trim());
            setMessages((prev) => [...prev, sentMessage]);
            setMessageText("");
            inputRef.current?.focus();
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEndSession = async () => {
        if (!requestId || !user) return;
        
        if (!confirm("Are you sure you want to end this session? This action cannot be undone.")) {
            return;
        }

        try {
            const { error } = await supabase
                .from('auth_requests')
                .update({ status: 'completed' })
                .eq('id', requestId);

            if (error) throw error;

            toast.success("Session ended successfully");
            // Navigate back
            if (window.location.pathname.includes('/expert/')) {
                navigate('/expert/dashboard');
            } else {
                navigate('/admin/expert-auth');
            }
        } catch (error: any) {
            console.error("Error ending session:", error);
            toast.error("Failed to end session. Please try again.");
        }
    };

    const handleSessionExpire = async () => {
        if (!requestId) return;
        
        try {
            await supabase
                .from('auth_requests')
                .update({ status: 'completed' })
                .eq('id', requestId);
            
            toast.info("Session expired. The chat has been closed.");
            // Navigate back
            if (window.location.pathname.includes('/expert/')) {
                navigate('/expert/dashboard');
            } else {
                navigate('/admin/expert-auth');
            }
        } catch (error) {
            console.error("Error updating expired session:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-admin-bg items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-admin-gold mb-4" />
                <p className="text-gray-400">Initializing chat...</p>
            </div>
        );
    }

    if (!userUID) {
        return (
            <div className="flex flex-col h-screen bg-admin-bg items-center justify-center p-4">
                <p className="text-gray-400 text-center">
                    Unable to load chat. Please try again.
                </p>
            </div>
        );
    }

    // Check if we're in expert route (independent page) or admin route (nested)
    const isExpertRoute = window.location.pathname.includes('/expert/');

    return (
        <div className={cn(
            "flex flex-col bg-admin-bg relative overflow-hidden",
            isExpertRoute ? "fixed inset-0 h-screen w-screen z-50" : "h-full"
        )}>
            {/* Custom Header */}
            <header className="flex items-center gap-3 p-4 border-b border-admin-border bg-admin-surface/95 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
                <button 
                    onClick={() => {
                        // Navigate back based on current route
                        if (isExpertRoute) {
                            navigate('/expert/dashboard');
                        } else {
                            navigate('/admin/expert-auth');
                        }
                    }} 
                    className="p-2 -ml-2 hover:bg-admin-gold/10 rounded-full transition-colors text-admin-gold"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setShowProfile(true)}
                    className="flex-1 min-w-0 flex items-center gap-3"
                >
                    {userAvatar && (
                        <div className="w-10 h-10 rounded-full border-2 border-admin-gold/30 p-0.5 flex-shrink-0">
                            <img 
                                src={userAvatar} 
                                className="w-full h-full rounded-full object-cover" 
                                alt={userName}
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                        <h2 className="font-serif font-bold text-lg tracking-wide text-white truncate">
                            {userName}
                        </h2>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 flex items-center gap-1.5 font-medium">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Chat
                        </p>
                    </div>
                </button>
                {requestImages.length > 0 && (
                    <button
                        onClick={() => setShowImages(true)}
                        className="p-2 hover:bg-admin-gold/10 rounded-full transition-colors text-admin-gold"
                        title="View Coin Images"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                )}
                {sessionStartTime && (
                    <SessionTimer
                        startTime={sessionStartTime}
                        duration={5 * 60 * 1000} // 5 minutes
                        onExpire={handleSessionExpire}
                        className="bg-admin-gold/10 text-admin-gold border-admin-gold/20"
                    />
                )}
            </header>

            {/* Messages Container */}
            <div className={cn(
                "flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-admin-bg via-admin-bg to-admin-surface/30",
                isExpertRoute ? "pb-4" : ""
            )}>
                <AnimatePresence mode="popLayout">
                    {messages.map((msg) => {
                        const isMe = msg.senderId === user?.id;
                        const messageDate = new Date(msg.sentAt);
                        const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "flex gap-2 max-w-[85%]",
                                    isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                {!isMe && (
                                    <img
                                        src={userAvatar || "https://i.pravatar.cc/150?img=1"}
                                        alt={userName}
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-admin-gold/20"
                                    />
                                )}

                                <div
                                    className={cn(
                                        "rounded-2xl px-4 py-3 border shadow-sm",
                                        isMe
                                            ? "bg-gradient-to-br from-admin-gold to-admin-gold2 text-admin-bg border-admin-gold/30 rounded-br-md"
                                            : "bg-admin-surface border-admin-border rounded-bl-md text-admin-text"
                                    )}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                        {msg.text}
                                    </p>
                                    <p
                                        className={cn(
                                            "text-[10px] mt-2 flex items-center gap-1",
                                            isMe ? "text-admin-bg/70 justify-end" : "text-gray-400"
                                        )}
                                    >
                                        {timeString}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <footer className={cn(
                "sticky bottom-0 bg-admin-surface/95 backdrop-blur-lg border-t border-admin-border p-3",
                isExpertRoute ? "pb-24 md:pb-3" : "" // Add padding for mobile bottom nav
            )}>
                <div className="flex items-end gap-2 mb-2">
                    <button className="p-2.5 text-gray-400 hover:text-admin-gold hover:bg-admin-gold/10 rounded-full transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="pr-12 bg-admin-bg border-admin-border rounded-full h-12 text-admin-text placeholder:text-gray-500 focus:border-admin-gold focus:ring-admin-gold/20"
                            disabled={sending}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!messageText.trim() || sending}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-admin-gold text-admin-bg hover:bg-admin-gold2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {sending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
                <Button
                    onClick={handleEndSession}
                    variant="outline"
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                >
                    <X className="w-4 h-4 mr-2" />
                    End Session
                </Button>
            </footer>

            {/* Profile View Modal */}
            {userProfile && (
                <ProfileView
                    profile={userProfile}
                    isOpen={showProfile}
                    onClose={() => setShowProfile(false)}
                />
            )}

            {/* Image Gallery Modal */}
            {requestImages.length > 0 && (
                <ImageGallery
                    images={requestImages}
                    isOpen={showImages}
                    onClose={() => setShowImages(false)}
                    title="Coin Images"
                />
            )}
        </div>
    );
}
