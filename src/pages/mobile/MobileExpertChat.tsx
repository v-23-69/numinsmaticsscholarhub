import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ShieldAlert, BadgeCheck, Loader2, CheckCircle, Send, Image as ImageIcon, Paperclip, User, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { initCometChat, loginCometChat, createCometChatUser, getCometChatUser } from "@/lib/cometchat";
import { sendTextMessage, fetchMessages, createMessageListener, ChatMessage } from "@/lib/cometchat-messages";
import { PremiumNavBar } from "@/components/mobile/PremiumNavBar";
import { SessionTimer } from "@/components/chat/SessionTimer";
import { ProfileView } from "@/components/chat/ProfileView";
import { generateAndSaveSessionDocument } from "@/utils/documentGenerator";

export default function MobileExpertChat() {
    const { id: requestId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [expert, setExpert] = useState<any>(null);
    const [expertUID, setExpertUID] = useState<string | null>(null);
    const [sessionStatus, setSessionStatus] = useState("active");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [showProfile, setShowProfile] = useState(false);
    const [requestData, setRequestData] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isSettingUpRef = useRef(false);

    useEffect(() => {
        if (!user || !requestId) return;

        let removeListener: (() => void) | null = null;
        let subscriptionChannel: any = null;

        const setupCometChat = async () => {
            // Prevent multiple simultaneous setups
            if (isSettingUpRef.current) {
                console.log('Setup already in progress, skipping...');
                return;
            }
            isSettingUpRef.current = true;

            try {
                setLoading(true);

                // 1. Fetch auth request details
                const { data: reqData, error: reqError } = await supabase
                    .from('auth_requests')
                    .select('status, assigned_expert_id, paid, session_started_at, created_at, description')
                    .eq('id', requestId)
                    .single();
                
                if (reqError || !reqData) {
                    toast.error("Authentication request not found");
                    navigate('/authenticate');
                    isSettingUpRef.current = false;
                    return;
                }
                
                const requestData = reqData as any;
                setRequestData(requestData);

                // 2. Check if paid and expert assigned
                if (!requestData.paid) {
                    toast.error("Payment required to access chat");
                    navigate('/authenticate');
                    isSettingUpRef.current = false;
                    return;
                }

                if (!requestData.assigned_expert_id) {
                    setSessionStatus("waiting");
                    setLoading(false);
                    isSettingUpRef.current = false;
                    return; // Exit early, subscription will handle the rest
                }

                // 3. Check session status - allow viewing completed sessions
                if (requestData.status === 'rejected') {
                    setSessionStatus("closed");
                    setLoading(false);
                    isSettingUpRef.current = false;
                    return;
                }
                
                // Set session status - completed sessions can still be viewed
                if (requestData.status === 'completed') {
                    setSessionStatus("completed"); // Use different status for completed (read-only)
                } else {
                    // If we reach here, expert is assigned and session is active
                    setSessionStatus("active");
                }

                // 4. Fetch Expert Details
                const { data: expertProfile, error: expertError } = await supabase
                    .from('profiles')
                    .select('*, user_id, id')
                    .eq('id', (requestData as any).assigned_expert_id)
                    .maybeSingle();

                // Also try with user_id if id doesn't work
                const expertData = expertProfile || await supabase
                    .from('profiles')
                    .select('*, user_id, id')
                    .eq('user_id', (requestData as any).assigned_expert_id)
                    .maybeSingle()
                    .then(({ data }) => data);

                if (expertError && !expertData) {
                    console.warn("Error fetching expert profile (non-blocking):", expertError);
                }

                if (expertData) {
                    setExpert(expertData);
                    setExpertUID(requestData.assigned_expert_id);
                } else {
                    setExpertUID(requestData.assigned_expert_id);
                }

                // 5. Initialize CometChat SDK
                await initCometChat();

                // 6. Ensure current user exists in CometChat
                const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                await createCometChatUser(user.id, userName);

                // 7. Ensure expert exists in CometChat
                if (expertProfile) {
                    const expertName = expertProfile.display_name || expertProfile.username || 'Expert';
                    await createCometChatUser(requestData.assigned_expert_id, expertName);
                }

                // 8. Login current user to CometChat
                await loginCometChat(user.id);

                // 9. Set session start time
                const startTime = requestData.session_started_at 
                    ? new Date(requestData.session_started_at) 
                    : new Date(requestData.created_at);
                setSessionStartTime(startTime);

                // 10. Send queries automatically if they exist and no messages yet (only for active sessions)
                if (requestData.status !== 'completed' && requestData.description && requestData.description.trim()) {
                    try {
                        const previousMessages = await fetchMessages(requestData.assigned_expert_id, 1);
                        // Only send if no messages exist yet
                        if (previousMessages.length === 0) {
                            await sendTextMessage(requestData.assigned_expert_id, requestData.description);
                        }
                    } catch (error) {
                        console.error('Error sending queries:', error);
                    }
                }

                // 11. Fetch previous messages - only from this session
                if (requestData.assigned_expert_id) {
                    const allMessages = await fetchMessages(requestData.assigned_expert_id, 100);
                    // Filter messages to only include those from this session (after session_started_at or created_at)
                    const sessionStartTime = requestData.session_started_at 
                        ? new Date(requestData.session_started_at).getTime()
                        : new Date(requestData.created_at).getTime();
                    
                    // Only show messages from this session (messages sent after session started)
                    // For completed sessions, show all messages from the session
                    const sessionMessages = allMessages.filter(msg => {
                        return msg.sentAt >= sessionStartTime - 60000; // 1 minute buffer
                    });
                    
                    setMessages(sessionMessages.reverse()); // Reverse to show oldest first
                }

                // 12. Set up message listener (only for active sessions)
                if (requestData.assigned_expert_id && requestData.status !== 'completed') {
                    removeListener = createMessageListener(
                        `chat-${requestId}`,
                        (message) => {
                            setMessages((prev) => [...prev, message]);
                        }
                    );
                }

            } catch (error: any) {
                console.error("CometChat setup error:", error);
                toast.error(error.message || "Failed to initialize chat");
            } finally {
                setLoading(false);
                isSettingUpRef.current = false;
            }
        };

        // Set up real-time subscription to detect when expert accepts (always active)
        subscriptionChannel = supabase
            .channel(`auth_request_${requestId}_user`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'auth_requests',
                    filter: `id=eq.${requestId}`
                },
                async (payload) => {
                    console.log('Request updated:', payload);
                    const updatedRequest = payload.new as any;
                    const oldRequest = payload.old as any;
                    
                    // Check if expert was just assigned (was null, now has value)
                    if (updatedRequest.assigned_expert_id && !oldRequest?.assigned_expert_id) {
                        toast.success("Expert accepted your request! Setting up chat...");
                        // Re-run setup to initialize chat
                        await setupCometChat();
                    }
                }
            )
            .subscribe();

        // Initial setup
        setupCometChat();

        // Cleanup listener and subscription on unmount
        return () => {
            if (removeListener) {
                removeListener();
            }
            if (subscriptionChannel) {
                supabase.removeChannel(subscriptionChannel);
            }
        };
    }, [user, requestId, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!messageText.trim() || !expertUID || sending) return;

        setSending(true);
        try {
            const sentMessage = await sendTextMessage(expertUID, messageText.trim());
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
        if (!requestId || !user || !expertUID) return;
        
        if (!confirm("Are you sure you want to end this session? A document will be generated with all Q&A.")) {
            return;
        }

        try {
            // Generate and save session document before ending
            const expertName = expert?.display_name || expert?.username || 'Expert';
            const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
            
            toast.info("Generating session document...");
            
            // Format messages for document generation
            const formattedMessages: ChatMessage[] = messages.map(msg => ({
                id: msg.id,
                text: msg.text,
                senderId: msg.senderId,
                sentAt: msg.sentAt,
                senderName: msg.senderId === user.id ? userName : expertName,
            }));

            await generateAndSaveSessionDocument(
                requestId,
                user.id,
                expertUID,
                formattedMessages,
                expertName,
                userName
            );

            // Update session status
            const { error } = await supabase
                .from('auth_requests')
                .update({ status: 'completed' })
                .eq('id', requestId);

            if (error) throw error;

            toast.success("Session ended successfully. Document saved!");
            setSessionStatus("closed");
        } catch (error: any) {
            console.error("Error ending session:", error);
            toast.error("Failed to end session. Please try again.");
        }
    };

    const handleSessionExpire = async () => {
        if (!requestId || !user || !expertUID) return;
        
        try {
            // Generate document before expiring
            const expertName = expert?.display_name || expert?.username || 'Expert';
            const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
            
            const formattedMessages: ChatMessage[] = messages.map(msg => ({
                id: msg.id,
                text: msg.text,
                senderId: msg.senderId,
                sentAt: msg.sentAt,
                senderName: msg.senderId === user.id ? userName : expertName,
            }));

            await generateAndSaveSessionDocument(
                requestId,
                user.id,
                expertUID,
                formattedMessages,
                expertName,
                userName
            );

            await supabase
                .from('auth_requests')
                .update({ status: 'completed' })
                .eq('id', requestId);
            
            toast.info("Session expired. Document saved!");
            setSessionStatus("closed");
        } catch (error) {
            console.error("Error updating expired session:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-background items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold mb-4" />
                <p className="text-muted-foreground">Initializing chat...</p>
            </div>
        );
    }

    if (sessionStatus === "closed") {
        return (
            <div className="flex flex-col h-screen bg-background items-center justify-center p-4">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Session Closed</h2>
                <p className="text-muted-foreground text-center mb-6">
                    This authentication session has been completed or closed by the expert.
                </p>
                <button
                    onClick={() => navigate('/authenticate')}
                    className="px-6 py-3 bg-gold text-black rounded-xl font-medium hover:bg-gold-light transition-colors"
                >
                    Start New Authentication
                </button>
            </div>
        );
    }

    if (sessionStatus === "waiting") {
        return (
            <div className="flex flex-col h-screen bg-background items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <Loader2 className="w-12 h-12 animate-spin text-gold mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Waiting for Expert</h2>
                    <p className="text-muted-foreground text-center mb-6">
                        Your request is pending. An expert will accept it soon and you'll be automatically connected to chat.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Listening for updates...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!expertUID) {
        return (
            <div className="flex flex-col h-screen bg-background items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Request Accepted!</h2>
                    <p className="text-muted-foreground text-center mb-6">
                        An expert has accepted your request. Setting up chat...
                    </p>
                    <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background relative overflow-hidden">
            {/* Custom Header */}
            <header className="flex items-center gap-3 p-4 border-b border-gold/20 bg-card/95 backdrop-blur-xl sticky top-0 z-50 shadow-lg safe-area-inset-top">
                <button 
                    onClick={() => {
                        // If viewing completed session, go back to profile, otherwise go to authenticate
                        if (sessionStatus === "completed") {
                            navigate('/profile');
                        } else {
                            navigate('/authenticate');
                        }
                    }} 
                    className="p-2 -ml-2 hover:bg-gold/10 rounded-full transition-colors text-gold"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setShowProfile(true)}
                    className="flex-1 min-w-0 flex items-center gap-3"
                >
                    <div className="w-10 h-10 rounded-full border-2 border-gold/30 p-0.5 flex-shrink-0">
                        <img 
                            src={expert?.avatar_url || "https://i.pravatar.cc/150?img=12"} 
                            className="w-full h-full rounded-full object-cover" 
                            alt="Expert"
                        />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                            <h2 className="font-serif font-bold text-lg tracking-wide bg-gradient-to-r from-gold to-yellow-600 bg-clip-text text-transparent truncate">
                                {expert?.display_name || "Expert"}
                            </h2>
                            {expert && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/20 flex-shrink-0" />}
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 font-medium">
                            {sessionStatus === "completed" ? (
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full shadow-[0_0_8px_rgba(107,114,128,0.5)]" />
                            ) : (
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            )}
                            {sessionStatus === "completed" ? "Completed Session" : "Live Secure Channel"}
                        </p>
                    </div>
                </button>
                {sessionStartTime && (
                    <SessionTimer
                        startTime={sessionStartTime}
                        duration={5 * 60 * 1000} // 5 minutes
                        onExpire={handleSessionExpire}
                    />
                )}
            </header>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-background via-background to-card/30">
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
                                        src={expert?.avatar_url || "https://i.pravatar.cc/150?img=12"}
                                        alt="Expert"
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-gold/20"
                                    />
                                )}

                                <div
                                    className={cn(
                                        "rounded-2xl px-4 py-3 border shadow-sm",
                                        isMe
                                            ? "bg-gradient-to-br from-gold to-gold-light text-foreground border-gold/30 rounded-br-md"
                                            : "bg-card border-border/40 rounded-bl-md"
                                    )}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                        {msg.text}
                                    </p>
                                    <p
                                        className={cn(
                                            "text-[10px] mt-2 flex items-center gap-1",
                                            isMe ? "text-foreground/70 justify-end" : "text-muted-foreground"
                                        )}
                                    >
                                        {timeString}
                                        {isMe && msg.readAt && <CheckCircle className="w-3 h-3" />}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input - Hide for completed sessions */}
            {sessionStatus !== "completed" && (
                <footer className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border/40 p-3 pb-safe">
                    <div className="flex items-end gap-2 mb-2">
                        <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors">
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <div className="flex-1 relative">
                            <Input
                                ref={inputRef}
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="pr-12 bg-card border-border/60 rounded-full h-12 focus:border-gold focus:ring-gold/20"
                                disabled={sending}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!messageText.trim() || sending}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gold text-black hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            )}
            
            {/* Completed Session Footer */}
            {sessionStatus === "completed" && (
                <footer className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border/40 p-3 pb-safe">
                    <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground mb-3">
                            This session has been completed. You can view the chat history above.
                        </p>
                        <Button
                            onClick={() => navigate('/profile')}
                            variant="outline"
                            className="w-full border-gold/30 text-gold hover:bg-gold/10"
                        >
                            Back to Profile
                        </Button>
                    </div>
                </footer>
            )}

            {/* Profile View Modal */}
            {expert && (
                <ProfileView
                    profile={expert}
                    isOpen={showProfile}
                    onClose={() => setShowProfile(false)}
                />
            )}

            <PremiumNavBar />
        </div>
    );
}
