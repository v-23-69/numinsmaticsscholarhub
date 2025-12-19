import { User, Mail, Calendar, Shield, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface ProfileViewProps {
    profile: {
        display_name?: string;
        username?: string;
        avatar_url?: string;
        email?: string;
        phone?: string;
        bio?: string;
        created_at?: string;
        role?: string;
        user_id?: string;
        id?: string;
        social_links?: {
            instagram?: string;
            facebook?: string;
            twitter?: string;
            linkedin?: string;
        };
    };
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export function ProfileView({ profile, isOpen, onClose, className }: ProfileViewProps) {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isExpert, setIsExpert] = useState(false);

    useEffect(() => {
        const fetchRole = async () => {
            if (!profile.user_id && !profile.id) return;
            
            try {
                const userId = profile.user_id || profile.id;
                const { data, error } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', userId);

                if (!error && data && data.length > 0) {
                    const roles = data.map((r: any) => r.role);
                    const roleMap: Record<string, string> = {
                        'admin_market': 'Admin',
                        'master_admin': 'Admin',
                        'expert': 'Expert',
                        'buyer': 'User',
                        'seller': 'User'
                    };
                    
                    if (roles.includes('expert')) {
                        setUserRole('Expert');
                        setIsExpert(true);
                    } else if (roles.includes('admin_market') || roles.includes('master_admin')) {
                        setUserRole('Admin');
                    } else if (roles.includes('buyer') || roles.includes('seller')) {
                        setUserRole('User');
                    }
                }
            } catch (error) {
                console.log('Error fetching role (non-blocking):', error);
            }
        };

        if (isOpen && profile) {
            fetchRole();
        }
    }, [profile, isOpen]);

    if (!isOpen) return null;

    const socialLinks = profile.social_links || {};

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
                        "bg-card rounded-2xl p-6 max-w-sm w-full border border-gold/20 shadow-2xl max-h-[90vh] overflow-y-auto",
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
                            {(isExpert || userRole === 'Expert') && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 border-2 border-card">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                            )}
                            {userRole === 'Admin' && (
                                <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1.5 border-2 border-card">
                                    <BadgeCheck className="w-4 h-4 text-white" />
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
                            {userRole && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30">
                                    <Shield className="w-3 h-3 text-gold" />
                                    <span className="text-xs font-semibold text-gold">{userRole}</span>
                                </div>
                            )}
                        </div>

                        {profile.bio && (
                            <p className="text-sm text-muted-foreground text-center px-2">
                                {profile.bio}
                            </p>
                        )}

                        <div className="w-full space-y-3 pt-4 border-t border-border/40">
                            {profile.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-foreground break-all">{profile.email}</span>
                                </div>
                            )}
                            {profile.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-foreground">{profile.phone}</span>
                                </div>
                            )}
                            {profile.created_at && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-foreground">
                                        Joined {new Date(profile.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            
                            {/* Social Media Links */}
                            {(socialLinks.instagram || socialLinks.facebook || socialLinks.twitter || socialLinks.linkedin) && (
                                <div className="pt-3 border-t border-border/40">
                                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Social Media</p>
                                    <div className="flex items-center justify-center gap-3">
                                        {socialLinks.instagram && (
                                            <a 
                                                href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 hover:scale-110 transition-transform"
                                            >
                                                <Instagram className="w-4 h-4 text-pink-500" />
                                            </a>
                                        )}
                                        {socialLinks.facebook && (
                                            <a 
                                                href={socialLinks.facebook.startsWith('http') ? socialLinks.facebook : `https://facebook.com/${socialLinks.facebook}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 hover:scale-110 transition-transform"
                                            >
                                                <Facebook className="w-4 h-4 text-blue-500" />
                                            </a>
                                        )}
                                        {socialLinks.twitter && (
                                            <a 
                                                href={`https://twitter.com/${socialLinks.twitter.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 hover:scale-110 transition-transform"
                                            >
                                                <Twitter className="w-4 h-4 text-sky-500" />
                                            </a>
                                        )}
                                        {socialLinks.linkedin && (
                                            <a 
                                                href={socialLinks.linkedin.startsWith('http') ? socialLinks.linkedin : `https://linkedin.com/in/${socialLinks.linkedin}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-600/30 hover:scale-110 transition-transform"
                                            >
                                                <Linkedin className="w-4 h-4 text-blue-600" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
