
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Paperclip, Check, CheckCheck, Clock, ShieldAlert, BadgeCheck, Loader2 } from "lucide-react";
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

export default function MobileExpertChat() {
    const { id: requestId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sessionStatus, setSessionStatus] = useState<"active" | "closed">("active");
    const [threadId, setThreadId] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [typingUserId, setTypingUserId] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [expert, setExpert] = useState<any>(null);
    const [authRequest, setAuthRequest] = useState<any>(null);

    useEffect(() => {
        if (!user || !requestId) return;
        fetchSessionDetails();
    }, [user, requestId]);

    useEffect(() => {
        if (!threadId) return;
        
        // Subscribe to messages
        const messagesChannel = supabase
            .channel(`messages:${threadId}`)
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
                        // Avoid duplicates
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
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
                    setSessionStatus(updated.is_active ? "active" : "closed");
                    setTypingUserId(updated.typing_user_id);
                }
            )
            .subscribe();

        // Subscribe to typing indicators
        const typingChannel = supabase
            .channel(`typing:${threadId}`)
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'threads',
                    filter: `id=eq.${threadId}`
                },
                (payload) => {
                    const updated = payload.new as any;
                    if (updated.typing_user_id && updated.typing_user_id !== user?.id) {
                        setTypingUserId(updated.typing_user_id);
                        // Clear typing indicator after 3 seconds
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => {
                            setTypingUserId(null);
                        }, 3000);
                    } else {
                        setTypingUserId(null);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(messagesChannel);
            supabase.removeChannel(typingChannel);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [threadId, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUserId]);

    const fetchSessionDetails = async () => {
        if (!requestId) return;
        
        setLoading(true);
        try {
            // 1. Get Auth Request
            const { data: reqData, error: reqError } = await supabase
                .from('auth_requests')
                .select('*, assigned_expert_id')
                .eq('id', requestId)
                .single();

            if (reqError || !reqData) {
                toast.error("Authentication request not found");
                navigate('/authenticate');
                return;
            }

            setAuthRequest(reqData);

            // Check if user owns this request
            if (reqData.user_id !== user?.id) {
                toast.error("Access denied");
                navigate('/authenticate');
                return;
            }

            // 2. Get Thread ID linked to this Auth Request
            const { data: threadData, error: threadError } = await supabase
                .from('threads')
                .select('*')
                .eq('auth_request_id', requestId)
                .single();

            if (threadError || !threadData) {
                // Thread not created yet - wait for expert assignment
                setLoading(false);
                return;
            }

            setThreadId(threadData.id);
            setIsActive(threadData.is_active || false);
            setSessionStatus(threadData.is_active ? "active" : "closed");

            // 3. Fetch Messages
            const { data: msgs, error: msgsError } = await supabase
                .from('messages')
                .select('*')
                .eq('thread_id', threadData.id)
                .order('created_at', { ascending: true });

            if (msgs) setMessages(msgs);

            // 4. Fetch Expert Details if assigned
            if (reqData.assigned_expert_id) {
                const { data: expertProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', reqData.assigned_expert_id)
                    .single();
                setExpert(expertProfile);
            }
        } catch (error: any) {
            console.error('Error fetching session:', error);
            toast.error("Failed to load chat session");
        } finally {
            setLoading(false);
        }
    };

    const handleTyping = async () => {
        if (!threadId || !isActive) return;
        
        if (!isTyping) {
            setIsTyping(true);
            await supabase.rpc('set_typing_indicator', {
                thread_id_param: threadId,
                is_typing: true
            });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        // Set timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(async () => {
            setIsTyping(false);
            await supabase.rpc('set_typing_indicator', {
                thread_id_param: threadId,
                is_typing: false
            });
        }, 2000);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !threadId || !isActive) return;
        
        const tempMsg = newMessage;
        setNewMessage("");

        // Stop typing indicator
        if (isTyping) {
            setIsTyping(false);
            await supabase.rpc('set_typing_indicator', {
                thread_id_param: threadId,
                is_typing: false
            });
        }

        const { error } = await supabase.from('messages').insert({
            thread_id: threadId,
            sender_id: user?.id,
            content: tempMsg
        });

        if (error) {
            console.error('Error sending message:', error);
            toast.error("Failed to send message");
            setNewMessage(tempMsg); // Revert
        } else {
            // Update thread last_message_at
            await supabase
                .from('threads')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', threadId);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-background to-background pointer-events-none" />

            {/* Header */}
            <header className="flex items-center gap-3 p-4 border-b border-gold/10 bg-card/80 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
                <button onClick={() => navigate('/authenticate')} className="p-2 -ml-2 hover:bg-gold/10 rounded-full transition-colors text-gold">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="font-serif font-bold text-lg tracking-wide bg-gradient-to-r from-gold to-yellow-600 bg-clip-text text-transparent">
                            {expert ? expert.display_name : "Dr. Anand Kumar"}
                        </h2>
                        {expert && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/20" />}
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 font-medium">
                        {sessionStatus === 'active' ? (
                            <><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> Live Secure Channel</>
                        ) : (
                            <><ShieldAlert className="w-3 h-3 text-red-500" /> Session Closed</>
                        )}
                    </p>
                </div>
                {/* Expert Avatar */}
                <div className="w-10 h-10 rounded-full border-2 border-gold/30 p-0.5 pointer-events-none">
                    <img src={expert?.avatar_url || "https://i.pravatar.cc/150?img=12"} className="w-full h-full rounded-full object-cover" />
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    </div>
                ) : !threadId ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-gold/50" />
                        <p className="font-medium">Waiting for expert assignment...</p>
                        <p className="text-sm mt-2 opacity-70">Your request is being reviewed. An expert will be assigned soon.</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground opacity-50">
                        <Clock className="w-12 h-12 mx-auto mb-3" />
                        <p>Start the conversation...</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-3 text-sm transition-all duration-200",
                                isMe 
                                    ? 'message-tile-user rounded-tr-sm' 
                                    : 'message-tile-expert rounded-tl-sm'
                            )}>
                                <p className="leading-relaxed">{msg.content}</p>
                                <div className={cn(
                                    "text-[10px] mt-2 flex items-center gap-1 opacity-70",
                                    isMe ? 'justify-end' : 'justify-start'
                                )}>
                                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isMe && (
                                        <span className={cn(
                                            "ml-1",
                                            msg.is_read ? "text-gold" : "text-muted-foreground"
                                        )}>
                                            {msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                        );
                    })}
                    
                    {/* Typing Indicator */}
                    <AnimatePresence>
                        {typingUserId && typingUserId !== user?.id && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex justify-start"
                            >
                                <div className="message-tile-expert rounded-tl-sm px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card/90 backdrop-blur-xl border-t border-gold/20 z-20 pb-8 shadow-lg shadow-background/50">
                {sessionStatus === 'active' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 items-end"
                    >
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-gold hover:bg-gold/10 rounded-full h-12 w-12 shrink-0 transition-all">
                                <Paperclip className="w-5 h-5" />
                            </Button>
                        </motion.div>
                        <div className="flex-1 relative">
                            <Input
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="Type your message..."
                                disabled={!isActive}
                                className="bg-background/60 border-gold/30 focus:border-gold/60 focus:ring-2 focus:ring-gold/20 rounded-2xl h-12 pl-4 pr-4 transition-all placeholder:text-muted-foreground disabled:opacity-50"
                            />
                        </div>
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <Button
                                onClick={sendMessage}
                                size="icon"
                                className="bg-gold text-primary-foreground hover:bg-gold-light rounded-2xl h-12 w-12 shadow-lg shadow-gold/50 shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!newMessage.trim() || !isActive}
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 bg-muted/40 rounded-xl border-2 border-gold/20 text-center"
                    >
                        <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-gold/50" />
                        <p className="text-sm font-medium mb-2">Session Ended</p>
                        <p className="text-xs text-muted-foreground mb-4">This session has been closed. Start a new authentication to continue.</p>
                        <Button 
                            onClick={() => navigate('/authenticate')} 
                            variant="outline" 
                            className="w-full border-gold/40 text-gold hover:bg-gold/10 transition-all"
                        >
                            Start New Authentication
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
