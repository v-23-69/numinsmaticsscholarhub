import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Video, MoreVertical, Send, Image, Paperclip, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachments?: { type: "image" | "coin"; url: string; coinId?: string; coinTitle?: string }[];
}

const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "expert",
    content: "Hello! I've received your coin images for authentication. Let me take a closer look.",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    senderId: "me",
    content: "Thank you! I'm really curious about its authenticity and potential value.",
    timestamp: "10:32 AM",
  },
  {
    id: "3",
    senderId: "expert",
    content: "This appears to be a genuine Shah Jahan gold mohur from the Agra mint. The calligraphy style and weight are consistent with authentic pieces from this period.",
    timestamp: "10:45 AM",
  },
  {
    id: "4",
    senderId: "expert",
    content: "I've completed my analysis. Here's my assessment:",
    timestamp: "10:50 AM",
    attachments: [
      {
        type: "coin",
        url: "https://images.unsplash.com/photo-1621264448270-9ef00e88a935?w=200&h=200&fit=crop",
        coinId: "1",
        coinTitle: "Shah Jahan Gold Mohur - Authenticated",
      },
    ],
  },
  {
    id: "5",
    senderId: "me",
    content: "That's wonderful news! What would you estimate its value to be?",
    timestamp: "10:52 AM",
  },
  {
    id: "6",
    senderId: "expert",
    content: "Based on current market conditions and the coin's excellent preservation, I'd estimate its value between ₹2,50,000 - ₹3,00,000. The clear calligraphy and minimal wear add significant value.",
    timestamp: "10:55 AM",
  },
];

const expertUser = {
  name: "Dr. Anand Kumar",
  avatar: "https://i.pravatar.cc/150?img=12",
  status: "Online",
  isExpert: true,
};

export default function MobileChatRoom() {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        senderId: "me",
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/40 safe-area-inset-top">
        <div className="flex items-center h-14 px-4 gap-3">
          <Link to="/messages" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <img
                src={expertUser.avatar}
                alt={expertUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {expertUser.isExpert && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald flex items-center justify-center border-2 border-background">
                  <Shield className="w-2 h-2 text-primary-foreground" />
                </div>
              )}
            </div>
            <div>
              <h1 className="font-semibold text-sm">{expertUser.name}</h1>
              <p className="text-xs text-emerald">{expertUser.status}</p>
            </div>
          </div>

          <button className="p-2">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 -mr-2">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === "me";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn("flex", isMe ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary rounded-bl-md"
                )}
              >
                <p className="text-sm">{msg.content}</p>
                
                {/* Attachments */}
                {msg.attachments?.map((att, i) => (
                  <div key={i} className="mt-2">
                    {att.type === "coin" && (
                      <Link
                        to={`/marketplace/coin/${att.coinId}`}
                        className="block rounded-xl overflow-hidden border border-border/50"
                      >
                        <img
                          src={att.url}
                          alt=""
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 bg-background/50">
                          <p className="text-xs font-medium text-foreground">
                            {att.coinTitle}
                          </p>
                        </div>
                      </Link>
                    )}
                    {att.type === "image" && (
                      <img
                        src={att.url}
                        alt=""
                        className="rounded-xl max-w-full"
                      />
                    )}
                  </div>
                ))}
                
                <p
                  className={cn(
                    "text-[10px] mt-1",
                    isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}
                >
                  {msg.timestamp}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="sticky bottom-0 bg-background border-t border-border/40 p-3 safe-area-inset-bottom">
        <div className="flex items-end gap-2">
          <button className="p-2 text-muted-foreground">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground">
            <Image className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2.5 bg-secondary rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              message.trim()
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
