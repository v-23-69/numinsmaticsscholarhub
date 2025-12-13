
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Paperclip, Check, CheckCheck, Clock, ShieldAlert, BadgeCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
    const [sessionStatus, setSessionStatus] = useState("active");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [expert, setExpert] = useState<any>(null);

    // ... (logic remains same, just updating UI wrapper)

    useEffect(() => {
        if (!user || !requestId) return;
        fetchSessionDetails();
        const channel = subscribeToMessages();
        return () => { supabase.removeChannel(channel); };
    }, [user, requestId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchSessionDetails = async () => {
        // 1. Get Thread ID linked to this Auth Request
        const { data: threadData, error: threadError } = await supabase
            .from('threads')
            .select('*')
            .eq('auth_request_id', requestId)
            .single();

        if (threadError || !threadData) {
            toast.error("Chat session not found");
            return;
        }

        // 2. Fetch Messages
        const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('thread_id', threadData.id)
            .order('created_at', { ascending: true });

        if (msgs) setMessages(msgs);

        // 3. Check Request Status
        const { data: reqData } = await supabase
            .from('auth_requests')
            .select('status, assigned_expert_id')
            .eq('id', requestId)
            .single();

        if (reqData) {
            if (reqData.status === 'completed' || reqData.status === 'rejected') {
                setSessionStatus("closed");
            }
            // Fetch Expert Details if assigned
            if (reqData.assigned_expert_id) {
                const { data: expertProfile } = await supabase.from('profiles').select('*').eq('id', reqData.assigned_expert_id).single();
                setExpert(expertProfile);
            }
        }
        setLoading(false);
    };

    const subscribeToMessages = () => {
        return supabase
            .channel(`chat:${requestId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                // In real app, check thread_id match
                const newMsg = payload.new as Message;
                setMessages(prev => [...prev, newMsg]);
            })
            .subscribe();
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        const tempMsg = newMessage;
        setNewMessage("");

        // Get Thread ID again (optimize by storing in state)
        const { data: thread } = await supabase.from('threads').select('id').eq('auth_request_id', requestId).single();
        if (!thread) return;

        const { error } = await supabase.from('messages').insert({
            thread_id: thread.id,
            sender_id: user?.id,
            content: tempMsg
        });

        if (error) {
            toast.error("Failed to send");
            setNewMessage(tempMsg); // Revert
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
                {messages.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground opacity-50">
                        <Clock className="w-12 h-12 mx-auto mb-3" />
                        <p>Waiting for expert response...</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] rounded-2xl px-4 py-3 text-sm
                                ${isMe ? 'bg-gold/20 text-gold-light border border-gold/30 rounded-tr-none' : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-none'}
                            `}>
                                {msg.content}
                                <div className={`text-[10px] mt-1 flex items-center gap-1 opacity-60 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && (msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card/80 backdrop-blur-md border-t border-gold/10 z-20 pb-8">
                {sessionStatus === 'active' ? (
                    <div className="flex gap-3 items-end">
                        <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-gold hover:bg-gold/10 rounded-full h-12 w-12 shrink-0">
                            <Paperclip className="w-5 h-5" />
                        </Button>
                        <div className="flex-1 relative">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type your message..."
                                className="bg-background/50 border-gold/20 focus:border-gold/50 rounded-2xl h-12 pl-4 pr-4 transition-all"
                            />
                        </div>
                        <Button
                            onClick={sendMessage}
                            size="icon"
                            className="bg-gold text-primary-foreground hover:bg-gold-light rounded-2xl h-12 w-12 shadow-[0_4px_12px_-4px_rgba(234,179,8,0.5)] shrink-0"
                            disabled={!newMessage.trim()}
                        >
                            <Send className="w-5 h-5 ml-0.5" />
                        </Button>
                    </div>
                ) : (
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50 text-center">
                        <p className="text-sm text-muted-foreground mb-3">This session has been closed by the expert.</p>
                        <Button onClick={() => navigate('/authenticate')} variant="outline" className="w-full border-gold/30 text-gold hover:bg-gold/5">
                            Start New Authentication
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
