import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Sun, Moon, Monitor, Check, 
  ChevronRight, Bell, Lock, HelpCircle, 
  FileText, Shield, LogOut, Palette
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

interface ThemeOption {
  id: Theme;
  label: string;
  description: string;
  icon: React.ElementType;
}

const themeOptions: ThemeOption[] = [
  {
    id: "system",
    label: "System Default",
    description: "Follow your device settings",
    icon: Monitor,
  },
  {
    id: "light",
    label: "Cream & Gold",
    description: "Museum heritage aesthetic",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Black & Gold",
    description: "Royal luxury aesthetic",
    icon: Moon,
  },
];

const settingsGroups = [
  {
    title: "Appearance",
    items: [
      { id: "theme", label: "Theme", icon: Palette, hasChevron: true },
    ],
  },
  {
    title: "Account",
    items: [
      { id: "notifications", label: "Notifications", icon: Bell, hasChevron: true },
      { id: "privacy", label: "Privacy & Security", icon: Lock, hasChevron: true },
    ],
  },
  {
    title: "Support",
    items: [
      { id: "help", label: "Help Center", icon: HelpCircle, hasChevron: true },
      { id: "terms", label: "Terms of Service", icon: FileText, hasChevron: true },
      { id: "about", label: "About NSH", icon: Shield, hasChevron: true },
    ],
  },
];

export default function MobileSettings() {
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSettingClick = (id: string) => {
    if (id === "theme") {
      setShowThemePicker(true);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-theme">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong safe-area-inset-top">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-serif font-semibold text-lg pr-7">
            Settings
          </h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Theme Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-gold-trim p-4"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              resolvedTheme === "dark" 
                ? "bg-gradient-to-br from-gold to-gold-light" 
                : "bg-gradient-to-br from-gold-dark to-gold"
            )}>
              {resolvedTheme === "dark" ? (
                <Moon className="w-6 h-6 text-background" />
              ) : (
                <Sun className="w-6 h-6 text-background" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">Current Theme</p>
              <p className="text-sm text-muted-foreground">
                {theme === "system" 
                  ? `System (${resolvedTheme === "dark" ? "Dark" : "Light"})` 
                  : theme === "dark" 
                    ? "Black & Gold" 
                    : "Cream & Gold"
                }
              </p>
            </div>
            <button
              onClick={() => setShowThemePicker(true)}
              className="btn-outline-gold px-4 py-2 text-sm"
            >
              Change
            </button>
          </div>
        </motion.div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <motion.section
            key={group.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {group.title}
            </h2>
            <div className="card-embossed divide-y divide-border">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSettingClick(item.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.hasChevron && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.section>
        ))}

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 card-embossed hover:bg-destructive/10 transition-colors text-destructive"
          >
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium">Log Out</span>
          </button>
        </motion.div>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          NSH – Numismatics Scholar Hub v1.0.0
        </p>
      </main>

      {/* Theme Picker Bottom Sheet */}
      <AnimatePresence>
        {showThemePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowThemePicker(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4 border-b border-border">
                <h2 className="font-serif text-xl font-semibold text-center">
                  Choose Theme
                </h2>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Select your preferred appearance
                </p>
              </div>

              {/* Theme Options */}
              <div className="p-4 space-y-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = theme === option.id;
                  
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
                        isSelected 
                          ? "card-gold-trim gold-glow" 
                          : "card-embossed hover:bg-muted/30"
                      )}
                    >
                      {/* Theme Preview */}
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300",
                        option.id === "dark" 
                          ? "bg-[#0B0B0C] border border-gold/30" 
                          : option.id === "light"
                            ? "bg-[#F8F3E8] border border-gold/30"
                            : "bg-gradient-to-br from-[#F8F3E8] to-[#0B0B0C] border border-gold/30"
                      )}>
                        <Icon className={cn(
                          "w-6 h-6",
                          option.id === "dark" 
                            ? "text-gold" 
                            : option.id === "light"
                              ? "text-gold-dark"
                              : "text-gold"
                        )} />
                      </div>

                      {/* Label */}
                      <div className="flex-1 text-left">
                        <p className={cn(
                          "font-medium transition-colors",
                          isSelected && "text-gold"
                        )}>
                          {option.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>

                      {/* Checkmark */}
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                        isSelected 
                          ? "bg-gold text-background" 
                          : "bg-muted"
                      )}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="divider-gold mx-6" />

              {/* Live Preview */}
              <div className="p-6 pb-safe">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Live Preview
                </p>
                <div className={cn(
                  "rounded-2xl p-4 transition-all duration-500",
                  resolvedTheme === "dark" 
                    ? "bg-[#0B0B0C] border border-gold/20" 
                    : "bg-[#F8F3E8] border border-gold/30"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full",
                      resolvedTheme === "dark" ? "bg-[#1A1B1C]" : "bg-[#EFE9DB]"
                    )} />
                    <div className="flex-1">
                      <div className={cn(
                        "h-3 w-24 rounded",
                        resolvedTheme === "dark" ? "bg-[#1A1B1C]" : "bg-[#EFE9DB]"
                      )} />
                      <div className={cn(
                        "h-2 w-16 rounded mt-1",
                        resolvedTheme === "dark" ? "bg-[#111213]" : "bg-[#E5DFD1]"
                      )} />
                    </div>
                    <div className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium",
                      resolvedTheme === "dark" 
                        ? "bg-gold text-[#0B0B0C]" 
                        : "bg-gold-dark text-[#F8F3E8]"
                    )}>
                      Gold
                    </div>
                  </div>
                  <div className={cn(
                    "h-20 rounded-xl",
                    resolvedTheme === "dark" 
                      ? "bg-gradient-to-br from-[#1A1B1C] to-[#111213] border border-gold/10" 
                      : "bg-gradient-to-br from-[#EFE9DB] to-[#E5DFD1] border border-gold/20"
                  )} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
