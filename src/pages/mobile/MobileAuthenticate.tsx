import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Image, ArrowLeft, Check,
  Zap, MessageCircle, Wallet, Shield, Star, Loader2, Upload, Sparkles, Lock
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PremiumNavBar } from "@/components/mobile/PremiumNavBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImage } from "@/utils/uploadUtils";
import { initCometChat, createCometChatUser, loginCometChat } from "@/lib/cometchat";

type Step = "capture" | "review" | "payment";

export default function MobileAuthenticate() {
  const [step, setStep] = useState<Step>("capture");
  const [captures, setCaptures] = useState<{ front?: string; back?: string }>({});
  const [capturesFiles, setCapturesFiles] = useState<{ front?: File; back?: File }>({});
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSourceSelector, setShowSourceSelector] = useState<"front" | "back" | null>(null);
  const [queries, setQueries] = useState("");
  const [activeSession, setActiveSession] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
      checkActiveSession();
    }
  }, [user]);

  const checkActiveSession = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('auth_requests')
        .select('id, status, assigned_expert_id, created_at')
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_review'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const sessionAge = Date.now() - new Date(data.created_at).getTime();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (data.status === 'in_review' || (data.status === 'pending' && sessionAge < fiveMinutes)) {
          setActiveSession(data);
        }
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const fetchWalletBalance = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await (supabase.from('nsh_wallets' as any) as any)
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        const isPermissionError = error.code === 'PGRST301' || 
                                  error.code === '42501' || 
                                  (error as any).status === 403 || 
                                  error.message?.includes('permission') || 
                                  error.message?.includes('row-level security');
        
        if (isPermissionError) {
          console.log('Wallet not found or not accessible, creating new wallet with 500 coins...');
          const { error: rpcError } = await (supabase.rpc as any)('claim_demo_coins');
          if (!rpcError) {
            const { data: newData } = await (supabase.from('nsh_wallets' as any) as any)
              .select('balance')
              .eq('user_id', user.id)
              .maybeSingle();
            setWalletBalance(newData ? Number((newData as any).balance) : 500);
            return;
          } else {
            console.warn('Failed to create wallet via RPC:', rpcError);
            setWalletBalance(0);
            return;
          }
        }
        console.warn('Error fetching wallet (non-blocking):', error);
        setWalletBalance(0);
        return;
      }
      
      if (data) {
        setWalletBalance(Number((data as any).balance) || 0);
      } else {
        const { error: rpcError } = await (supabase.rpc as any)('claim_demo_coins');
        if (!rpcError) {
          setWalletBalance(500);
        } else {
          console.warn('Failed to create wallet:', rpcError);
          setWalletBalance(0);
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching wallet:', err);
      setWalletBalance(0);
    }
  };

  const handleSourceSelect = async (source: "camera" | "gallery") => {
    if (!showSourceSelector) return;

    if (fileInputRef.current) {
      if (source === "camera") {
        fileInputRef.current.setAttribute("capture", "environment");
      } else {
        fileInputRef.current.removeAttribute("capture");
      }
      fileInputRef.current.click();
    }
    setShowSourceSelector(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !showSourceSelector) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setCaptures(prev => ({ ...prev, [showSourceSelector]: result }));
      setCapturesFiles(prev => ({ ...prev, [showSourceSelector]: file }));
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentAndSubmit = async () => {
    if (!user) {
      toast({ title: "Error", description: "Please sign in to continue", variant: "destructive" });
      return;
    }

    if (walletBalance < 50) {
      toast({ title: "Insufficient Balance", description: "Please top up your NSH Wallet", variant: "destructive" });
      return;
    }

    if (!captures.front || !captures.back) {
      toast({ title: "Error", description: "Please capture both front and back images", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let frontUrl = captures.front;
      let backUrl = captures.back;

      if (capturesFiles.front) {
        frontUrl = await uploadImage(capturesFiles.front, 'coins', 'auth');
        if (!frontUrl) throw new Error("Failed to upload front image");
      }
      if (capturesFiles.back) {
        backUrl = await uploadImage(capturesFiles.back, 'coins', 'auth');
        if (!backUrl) throw new Error("Failed to upload back image");
      }

      const { data: success, error: payError } = await supabase.rpc('pay_for_auth_request' as any, { amount: 50 });
      if (payError || !success) throw new Error("Payment failed");

      const { data: request, error: reqError } = await supabase.from('auth_requests').insert({
        user_id: user?.id,
        images: [frontUrl, backUrl].filter(Boolean),
        description: queries.trim() || null,
        status: 'pending',
        paid: true,
        paid_amount: 50,
        session_started_at: new Date().toISOString()
      }).select().single();

      if (reqError) throw new Error("Failed to create request");

      const { error: threadError } = await supabase.from('threads').insert({
        type: 'expert',
        participant_ids: [user?.id],
        auth_request_id: request.id
      });

      if (threadError) throw new Error("Failed to initialize session");

      toast({ title: "Success!", description: "Request submitted. Connecting to expert..." });

      if (queries.trim()) {
        try {
          await initCometChat();
          await createCometChatUser(user.id, user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
          await loginCometChat(user.id);
        } catch (error) {
          console.error('Error setting up chat for queries:', error);
        }
      }

      navigate(`/expert-chat/${request.id}`);

    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(var(--blue-light))] to-background pb-20 relative overflow-hidden">
      {/* Premium Background Pattern - Theme Aware */}
      <div className="fixed inset-0 opacity-[0.02] dark:opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--gold)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue/10 via-transparent to-gold/5 pointer-events-none" />

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-card/95 via-[hsl(var(--blue-light)/0.95)] to-card/95 backdrop-blur-2xl border-b-2 border-gold/30 safe-area-inset-top shadow-2xl">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent shadow-[0_0_8px_hsl(var(--gold)/0.3)]" />
        <div className="flex items-center h-16 px-4">
          <motion.button 
            onClick={() => step === 'capture' ? navigate('/') : setStep('capture')} 
            className="p-2.5 -ml-2 rounded-xl hover:bg-blue/30 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div className="flex-1 text-center">
            <h1 className="font-serif font-bold text-lg bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
              Expert Authentication
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Secure Verification</p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-4 py-6 relative z-10">
        {/* Active Session Banner - Premium Design */}
        {activeSession && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-gold/15 via-gold/10 to-gold/5 border-2 border-gold/30 backdrop-blur-sm shadow-[0_8px_32px_rgba(212,175,55,0.2)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gold/30 blur-xl rounded-full" />
                  <MessageCircle className="w-6 h-6 text-gold relative z-10" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Active Session</p>
                  <p className="text-xs text-muted-foreground">Return to your chat</p>
                </div>
              </div>
              <Button
                onClick={() => navigate(`/expert-chat/${activeSession.id}`)}
                className="bg-gradient-to-r from-gold to-gold-light text-black hover:from-gold-light hover:to-gold h-10 px-5 font-semibold shadow-lg shadow-gold/30"
              >
                Back to Chat
              </Button>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Capture Step - Premium Design */}
          {step === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Premium Wallet Balance Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-end"
              >
                <div className="px-4 py-2.5 rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card backdrop-blur-sm flex items-center gap-2.5 shadow-lg">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Balance</p>
                    <p className="font-bold text-gold text-base leading-tight">₹{walletBalance}</p>
                  </div>
                </div>
              </motion.div>

              {/* Premium Title Section */}
              <div className="text-center py-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 mb-3"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full" />
                    <Shield className="w-6 h-6 text-gold relative z-10" />
                  </div>
                  <h2 className="font-serif font-bold text-2xl bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                    Capture Coin Images
                  </h2>
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  Front and Back photos required for expert authentication
                </p>
              </div>

              {/* Premium Image Capture Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Front Side */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSourceSelector('front')}
                  className={cn(
                    "relative aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 transition-all overflow-hidden group",
                    captures.front 
                      ? "border-2 border-gold shadow-[0_8px_32px_hsl(var(--gold)/0.3)]" 
                      : "border-2 border-dashed border-gold/50 hover:border-gold bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card backdrop-blur-sm"
                  )}
                >
                  {captures.front ? (
                    <>
                      <img src={captures.front} alt="Front" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="px-3 py-1.5 rounded-lg bg-gold/90 backdrop-blur-sm text-black text-xs font-bold">
                          Front Side
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center border border-gold/30 group-hover:border-gold/50 transition-colors">
                        <Camera className="w-8 h-8 text-gold" />
                      </div>
                      <span className="text-sm font-semibold text-gold">Front Side</span>
                      <span className="text-[10px] text-muted-foreground">Tap to capture</span>
                    </>
                  )}
                </motion.button>

                {/* Back Side */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSourceSelector('back')}
                  className={cn(
                    "relative aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 transition-all overflow-hidden group",
                    captures.back 
                      ? "border-2 border-gold shadow-[0_8px_32px_hsl(var(--gold)/0.3)]" 
                      : "border-2 border-dashed border-gold/40 hover:border-gold bg-card backdrop-blur-sm"
                  )}
                >
                  {captures.back ? (
                    <>
                      <img src={captures.back} alt="Back" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="px-3 py-1.5 rounded-lg bg-gold/90 backdrop-blur-sm text-black text-xs font-bold">
                          Back Side
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center border border-gold/30 group-hover:border-gold/50 transition-colors">
                        <Camera className="w-8 h-8 text-gold" />
                      </div>
                      <span className="text-sm font-semibold text-gold">Back Side</span>
                      <span className="text-[10px] text-muted-foreground">Tap to capture</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Premium Queries Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <label className="text-sm font-semibold text-foreground">Add Your Queries (Optional)</label>
                </div>
                <textarea
                  value={queries}
                  onChange={(e) => setQueries(e.target.value)}
                  placeholder="Ask any questions about your coin authentication..."
                  className="w-full min-h-[120px] p-4 rounded-2xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 resize-none backdrop-blur-sm transition-all"
                />
                <p className="text-xs text-muted-foreground px-1">
                  Your queries will be sent directly to the expert when the chat starts
                </p>
              </motion.div>

              {/* Premium Continue Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold text-base shadow-[0_8px_32px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={!captures.front || !captures.back || loading}
                  onClick={() => setStep("review")}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Review
                      <Zap className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Review & Payment Step - Premium Design */}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Premium Image Preview */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-square rounded-3xl overflow-hidden border-2 border-gold/30 shadow-2xl"
                >
                  <img src={captures.front} className="w-full h-full object-cover" alt="Front" />
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-gold/90 backdrop-blur-sm text-black text-xs font-bold">
                    Front
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative aspect-square rounded-3xl overflow-hidden border-2 border-gold/30 shadow-2xl"
                >
                  <img src={captures.back} className="w-full h-full object-cover" alt="Back" />
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-gold/90 backdrop-blur-sm text-black text-xs font-bold">
                    Back
                  </div>
                </motion.div>
              </div>

              {/* Premium Payment Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-blue/20 via-blue/15 to-blue/20 border-2 border-gold/30 backdrop-blur-sm shadow-2xl text-center space-y-5"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-gold" />
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Authentication Fee</p>
                </div>
                <div>
                  <p className="text-5xl font-serif font-bold bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                    50 <span className="text-2xl">NSH</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-muted via-[hsl(var(--blue))] to-muted border-2 border-gold/30 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-medium">Your Balance</span>
                  <span className={cn(
                    "text-lg font-bold",
                    walletBalance >= 50 ? "text-emerald-400" : "text-red-400"
                  )}>
                    ₹{walletBalance} NSH
                  </span>
                </div>

                {walletBalance < 50 && (
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-gold/40 text-gold hover:bg-gold/10 h-12 rounded-xl font-semibold" 
                    onClick={() => toast({ title: "Coming Soon", description: "Top-up feature is in development" })}
                  >
                    Top Up Wallet
                  </Button>
                )}
              </motion.div>

              {/* Premium Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold text-black font-bold text-base shadow-[0_8px_32px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={loading || walletBalance < 50}
                  onClick={handlePaymentAndSubmit}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Pay 50 NSH & Start Chat
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl border-2 border-gold/30 text-gold hover:bg-gold/10"
                  onClick={() => setStep("capture")}
                  disabled={loading}
                >
                  Back to Edit
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Premium Source Selector Drawer */}
      <AnimatePresence>
        {showSourceSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center"
            onClick={() => setShowSourceSelector(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full bg-gradient-to-b from-card via-[hsl(var(--blue-light))] to-card rounded-t-3xl p-6 space-y-4 border-t-2 border-gold/30 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center mb-2">
                <div className="w-12 h-1 rounded-full bg-gold/40" />
              </div>
              <h3 className="text-center font-serif font-bold text-xl text-foreground mb-4">Select Image Source</h3>
              <Button
                variant="outline"
                className="w-full h-16 text-lg border-2 border-gold/30 bg-gradient-to-br from-blue/30 to-blue/20 hover:from-blue/40 hover:to-blue/30 justify-start px-6 rounded-2xl font-semibold"
                onClick={() => handleSourceSelect("camera")}
              >
                <Camera className="w-6 h-6 mr-4 text-gold" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                className="w-full h-16 text-lg border-2 border-gold/30 bg-gradient-to-br from-blue/30 to-blue/20 hover:from-blue/40 hover:to-blue/30 justify-start px-6 rounded-2xl font-semibold"
                onClick={() => handleSourceSelect("gallery")}
              >
                <Image className="w-6 h-6 mr-4 text-blue-400" />
                Choose from Gallery
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground mt-2 h-12 rounded-xl"
                onClick={() => setShowSourceSelector(null)}
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumNavBar />
    </div>
  );
}
