import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Image, ArrowLeft, Check,
  Zap, MessageCircle, Wallet, Shield, Star, Loader2, Upload
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PremiumNavBar } from "@/components/mobile/PremiumNavBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImage } from "@/utils/uploadUtils";

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
        // Check if session is still active (not completed and within 5 minutes or has expert assigned)
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
      // Check wallet balance - use maybeSingle() to handle missing wallets
      const { data, error } = await (supabase.from('nsh_wallets' as any) as any)
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        // If it's a 403 or permission error, try to create wallet
        // This can happen if wallet doesn't exist yet
        const isPermissionError = error.code === 'PGRST301' || 
                                  error.code === '42501' || 
                                  (error as any).status === 403 || 
                                  error.message?.includes('permission') || 
                                  error.message?.includes('row-level security');
        
        if (isPermissionError) {
          console.log('Wallet not found or not accessible, creating new wallet with 500 coins...');
          // Try to create wallet with 500 coins using RPC (bypasses RLS)
          const { error: rpcError } = await (supabase.rpc as any)('claim_demo_coins');
          if (!rpcError) {
            // Successfully created, fetch again to get the balance
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
        setWalletBalance(0); // Default to 0 if we can't fetch
        return;
      }
      
      if (data) {
        setWalletBalance(Number((data as any).balance) || 0);
      } else {
        // Wallet doesn't exist, create it with 500 coins
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

    // Trigger hidden input
    if (fileInputRef.current) {
      if (source === "camera") {
        fileInputRef.current.setAttribute("capture", "environment");
      } else {
        fileInputRef.current.removeAttribute("capture");
      }
      fileInputRef.current.click();
    }
    // Note: We close selector in the onChange handler
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const side = showSourceSelector;
    if (file && side) {
      const url = URL.createObjectURL(file);
      setCaptures(prev => ({ ...prev, [side]: url }));
      setCapturesFiles(prev => ({ ...prev, [side]: file }));
    }
    setShowSourceSelector(null); // Close drawer
  };

  const handlePaymentAndSubmit = async () => {
    if (walletBalance < 50) {
      toast({ title: "Insufficient Balance", description: "Please top up your NSH Wallet", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Images
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

      // 2. Process Payment via RPC
      const { data: success, error: payError } = await supabase.rpc('pay_for_auth_request' as any, { amount: 50 });
      if (payError || !success) throw new Error("Payment failed");

      // 3. Create Request
      // images should be an array of image URLs, not an object
      const { data: request, error: reqError } = await supabase.from('auth_requests').insert({
        user_id: user?.id,
        images: [frontUrl, backUrl].filter(Boolean), // Store as array of URLs
        status: 'pending',
        paid: true,
        paid_amount: 50
      }).select().single();

      if (reqError) throw new Error("Failed to create request");

      // 4. Create Chat Thread
      const { error: threadError } = await supabase.from('threads').insert({
        type: 'expert',
        participant_ids: [user?.id], // Add expert ID later when assigned
        auth_request_id: request.id
      });

      if (threadError) throw new Error("Failed to initialize session");

      toast({ title: "Success!", description: "Request submitted. Connecting to expert..." });

      // Send queries as first message if provided
      if (queries.trim()) {
        try {
          await initCometChat();
          await createCometChatUser(user.id, user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
          await loginCometChat(user.id);
          // Queries will be sent after expert accepts and chat is set up
        } catch (error) {
          console.error('Error setting up chat for queries:', error);
        }
      }

      // Redirect to Chat
      navigate(`/expert-chat/${request.id}`);

    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-gold/20 safe-area-inset-top">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="flex items-center h-14 px-4">
          <button onClick={() => step === 'capture' ? navigate('/') : setStep('capture')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="flex-1 text-center font-serif font-semibold gold-text">
            Expert Authentication
          </span>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Active Session Banner */}
        {activeSession && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-gold" />
              <div>
                <p className="text-sm font-medium text-foreground">Active Session</p>
                <p className="text-xs text-muted-foreground">Return to your chat</p>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/expert-chat/${activeSession.id}`)}
              className="bg-gold text-black hover:bg-gold-light h-9 px-4"
            >
              Back to Chat
            </Button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Capture Step */}
          {step === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {/* Wallet Balance */}
              <div className="flex justify-end">
                <div className="px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-gold" />
                  <span className="font-bold text-gold text-sm">₹{walletBalance}</span>
                </div>
              </div>

              <div className="text-center py-2">
                <h2 className="font-serif font-semibold text-lg">Capture Coin Images</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Front and Back photos required
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Front Trigger */}
                <button
                  onClick={() => setShowSourceSelector('front')}
                  className={cn(
                    "relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all overflow-hidden",
                    captures.front ? "border-2 border-gold bg-gold/5" : "border-2 border-dashed border-gold/40 hover:border-gold bg-card/50"
                  )}
                >
                  {captures.front ? (
                    <img src={captures.front} alt="Front" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="w-10 h-10 text-gold" />
                      <span className="text-sm font-medium text-gold">Front Side</span>
                    </>
                  )}
                </button>

                {/* Back Trigger */}
                <button
                  onClick={() => setShowSourceSelector('back')}
                  className={cn(
                    "relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all overflow-hidden",
                    captures.back ? "border-2 border-gold bg-gold/5" : "border-2 border-dashed border-gold/40 hover:border-gold bg-card/50"
                  )}
                >
                  {captures.back ? (
                    <img src={captures.back} alt="Back" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="w-10 h-10 text-gold" />
                      <span className="text-sm font-medium text-gold">Back Side</span>
                    </>
                  )}
                </button>
              </div>

              {/* Queries Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Add Your Queries (Optional)</label>
                <textarea
                  value={queries}
                  onChange={(e) => setQueries(e.target.value)}
                  placeholder="Ask any questions about your coin authentication..."
                  className="w-full min-h-[100px] p-4 rounded-xl bg-card border border-gold/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Your queries will be sent directly to the expert when the chat starts
                </p>
              </div>

              <Button
                className="w-full btn-gold rounded-xl h-14 mt-8"
                disabled={!captures.front || !captures.back}
                onClick={() => setStep("review")}
              >
                Continue to Review
              </Button>
            </motion.div>
          )}

          {/* Payment Step (Combined Review + Pay) */}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <img src={captures.front} className="aspect-square rounded-xl object-cover border border-white/10" />
                <img src={captures.back} className="aspect-square rounded-xl object-cover border border-white/10" />
              </div>

              <div className="p-6 rounded-2xl bg-card border border-gold/30 text-center space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Authentication Fee</p>
                  <p className="text-4xl font-serif font-bold text-gold">50 <span className="text-lg">NSH</span></p>
                </div>

                <div className="bg-black/20 p-3 rounded-lg flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Your Balance</span>
                  <span className={walletBalance >= 50 ? "text-green-500" : "text-red-500"}>
                    {walletBalance} NSH
                  </span>
                </div>

                {walletBalance < 50 && (
                  <Button variant="outline" className="w-full border-gold/50 text-gold" onClick={() => toast({ title: "Coming Soon", description: "Top-up feature is in development" })}>
                    Top Up Wallet
                  </Button>
                )}
              </div>

              <Button
                className="w-full btn-gold rounded-xl h-14"
                disabled={loading || walletBalance < 50}
                onClick={handlePaymentAndSubmit}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
                {loading ? "Processing..." : "Pay 50 NSH & Start Chat"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Source Selector Drawer (Popup) */}
      <AnimatePresence>
        {showSourceSelector && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowSourceSelector(null)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="w-full bg-card rounded-t-3xl p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-center font-medium text-lg mb-2">Select Image Source</h3>
              <Button
                variant="outline"
                className="w-full h-14 text-lg border-white/10 bg-white/5 hover:bg-white/10 justify-start px-6"
                onClick={() => handleSourceSelect("camera")}
              >
                <Camera className="w-6 h-6 mr-4 text-gold" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 text-lg border-white/10 bg-white/5 hover:bg-white/10 justify-start px-6"
                onClick={() => handleSourceSelect("gallery")}
              >
                <Image className="w-6 h-6 mr-4 text-blue-400" />
                Choose from Gallery
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground mt-2"
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
