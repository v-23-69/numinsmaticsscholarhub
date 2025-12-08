import { useState, useRef, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Image, 
  Paperclip, 
  Shield,
  CheckCircle2,
  Clock,
  FileText,
  Star,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type?: "text" | "assessment" | "certificate" | "coin-image";
  attachments?: { 
    type: "image" | "coin" | "certificate"; 
    url: string; 
    coinId?: string; 
    coinTitle?: string;
    verdict?: "authentic" | "uncertain" | "fake";
    estimatedValue?: string;
    period?: string;
    rarity?: string;
  }[];
}

const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "expert",
    content: "Welcome! I've received your coin images for authentication. Let me examine them carefully.",
    timestamp: "10:30 AM",
    type: "text",
  },
  {
    id: "2",
    senderId: "me",
    content: "Thank you Dr. Kumar! I'm very curious about this coin's history and authenticity.",
    timestamp: "10:32 AM",
    type: "text",
  },
  {
    id: "3",
    senderId: "expert",
    content: "I can see from the patina and strike quality that this is a significant piece. The calligraphy on the obverse is particularly well-preserved.",
    timestamp: "10:45 AM",
    type: "text",
  },
  {
    id: "4",
    senderId: "expert",
    content: "",
    timestamp: "10:50 AM",
    type: "assessment",
    attachments: [
      {
        type: "coin",
        url: "https://images.unsplash.com/photo-1621264448270-9ef00e88a935?w=400&h=400&fit=crop",
        coinId: "1",
        coinTitle: "Shah Jahan Gold Mohur",
        verdict: "authentic",
        estimatedValue: "₹2,50,000 - ₹3,00,000",
        period: "Mughal Empire (1628-1658)",
        rarity: "Rare",
      },
    ],
  },
  {
    id: "5",
    senderId: "me",
    content: "This is wonderful news! The detail in your assessment is very helpful.",
    timestamp: "10:52 AM",
    type: "text",
  },
  {
    id: "6",
    senderId: "expert",
    content: "I'll prepare the official authentication certificate for you. It will include all the details and can be used for insurance or resale purposes.",
    timestamp: "10:55 AM",
    type: "text",
  },
];

const expertUser = {
  name: "Dr. Anand Kumar",
  avatar: "https://i.pravatar.cc/150?img=12",
  status: "Online",
  isExpert: true,
  specialty: "Mughal & Ancient Indian Coins",
  rating: 4.9,
  authCount: 1240,
};

export default function MobileChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
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
        type: "text",
      },
    ]);
    setMessage("");
  };

  const renderAssessmentCard = (msg: Message) => {
    const attachment = msg.attachments?.[0];
    if (!attachment) return null;

    const verdictColors = {
      authentic: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/40",
      uncertain: "from-amber-500/20 to-amber-600/10 border-amber-500/40",
      fake: "from-red-500/20 to-red-600/10 border-red-500/40",
    };

    const verdictIcons = {
      authentic: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      uncertain: <Clock className="w-5 h-5 text-amber-400" />,
      fake: <Shield className="w-5 h-5 text-red-400" />,
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        {/* Assessment Card */}
        <div className={cn(
          "rounded-2xl overflow-hidden border bg-gradient-to-br backdrop-blur-sm",
          verdictColors[attachment.verdict || "authentic"]
        )}>
          {/* Card Header */}
          <div className="px-4 py-3 border-b border-border/20 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Expert Assessment
            </span>
          </div>

          {/* Coin Image */}
          <div className="relative">
            <img
              src={attachment.url}
              alt={attachment.coinTitle}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            
            {/* Verdict Badge */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-border/30">
                {verdictIcons[attachment.verdict || "authentic"]}
                <span className="text-sm font-semibold capitalize">
                  {attachment.verdict || "Authentic"}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {attachment.coinTitle}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/40 rounded-xl p-3 border border-border/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Period</p>
                <p className="text-xs font-medium text-foreground">{attachment.period}</p>
              </div>
              <div className="bg-background/40 rounded-xl p-3 border border-border/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Rarity</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  <p className="text-xs font-medium text-foreground">{attachment.rarity}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
              <p className="text-[10px] text-primary uppercase tracking-wider mb-1">Estimated Value</p>
              <p className="text-lg font-serif font-bold text-primary">{attachment.estimatedValue}</p>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-4 py-3 border-t border-border/20 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
            <button className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">
              <FileText className="w-3 h-3" />
              View Full Report
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMessage = (msg: Message, index: number) => {
    const isMe = msg.senderId === "me";
    const isAssessment = msg.type === "assessment";

    if (isAssessment) {
      return (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex justify-start"
        >
          <div className="flex gap-2 max-w-[90%]">
            <img
              src={expertUser.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
            />
            {renderAssessmentCard(msg)}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn("flex", isMe ? "justify-end" : "justify-start")}
      >
        <div className={cn("flex gap-2 max-w-[80%]", isMe && "flex-row-reverse")}>
          {!isMe && (
            <img
              src={expertUser.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          )}
          
          {/* Message Card */}
          <div
            className={cn(
              "rounded-2xl px-4 py-3 border shadow-sm",
              isMe
                ? "bg-primary text-primary-foreground border-primary/20 rounded-br-md"
                : "bg-card border-border/40 rounded-bl-md"
            )}
          >
            <p className="text-sm leading-relaxed">{msg.content}</p>
            
            {/* Regular Attachments */}
            {msg.attachments?.map((att, i) => (
              <div key={i} className="mt-3">
                {att.type === "image" && (
                  <img
                    src={att.url}
                    alt=""
                    className="rounded-xl max-w-full border border-border/20"
                  />
                )}
              </div>
            ))}
            
            <p
              className={cn(
                "text-[10px] mt-2 flex items-center gap-1",
                isMe ? "text-primary-foreground/60 justify-end" : "text-muted-foreground"
              )}
            >
              {msg.timestamp}
              {isMe && <CheckCircle2 className="w-3 h-3" />}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center h-16 px-4 gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary/50 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <img
                src={expertUser.avatar}
                alt={expertUser.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/30"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background">
                <Shield className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-semibold text-sm">{expertUser.name}</h1>
                <div className="flex items-center gap-0.5 text-primary">
                  <Star className="w-3 h-3 fill-primary" />
                  <span className="text-[10px] font-medium">{expertUser.rating}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{expertUser.specialty}</p>
            </div>
          </div>

          <button className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <Video className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 -mr-2 hover:bg-secondary/50 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Authentication Request Banner */}
        <div className="px-4 py-2 bg-primary/5 border-t border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Authentication Request #NSH-{id || "2847"}</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-medium">In Progress</span>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-background via-background to-card/30">
        {/* Session Start Indicator */}
        <div className="flex justify-center">
          <div className="bg-secondary/50 rounded-full px-4 py-1.5 border border-border/30">
            <p className="text-[10px] text-muted-foreground">Authentication session started • Today</p>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => renderMessage(msg, index))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border/40 p-3 pb-6">
        <div className="flex items-end gap-2">
          <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-full transition-colors">
            <Image className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your coin..."
              rows={1}
              className="w-full px-4 py-3 bg-card border border-border/40 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-muted-foreground/60"
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
              "w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg",
              message.trim()
                ? "bg-primary text-primary-foreground shadow-primary/30"
                : "bg-secondary text-muted-foreground shadow-none"
            )}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
