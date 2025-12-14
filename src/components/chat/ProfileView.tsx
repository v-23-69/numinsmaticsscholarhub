import { User, Mail, Calendar, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProfileViewProps {
    profile: {
        display_name?: string;
        username?: string;
        avatar_url?: string;
        email?: string;
        created_at?: string;
        role?: string;
    };
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export function ProfileView({ profile, isOpen, onClose, className }: ProfileViewProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={cn(
                        "bg-card rounded-2xl p-6 max-w-sm w-full border border-gold/20 shadow-2xl",
                        className
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            <img
                                src={profile.avatar_url || "https://i.pravatar.cc/150"}
                                alt={profile.display_name || "User"}
                                className="w-24 h-24 rounded-full object-cover border-4 border-gold/30"
                            />
                            {profile.role === 'expert' && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 border-2 border-card">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-bold font-serif text-foreground">
                                {profile.display_name || profile.username || "User"}
                            </h3>
                            {profile.username && profile.username !== profile.display_name && (
                                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                            )}
                        </div>

                        <div className="w-full space-y-3 pt-4 border-t border-border/40">
                            {profile.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground">{profile.email}</span>
                                </div>
                            )}
                            {profile.created_at && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground">
                                        Joined {new Date(profile.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {profile.role && (
                                <div className="flex items-center gap-3 text-sm">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground capitalize">{profile.role}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
