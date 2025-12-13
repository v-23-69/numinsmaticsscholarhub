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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) fetchWalletBalance();
  }, [user]);

  const fetchWalletBalance = async () => {
    if (!user) return;
    try {
      // Use RPC function to get balance (creates wallet if doesn't exist)
      const { data, error } = await supabase.rpc('get_wallet_balance');
      if (error) {
        console.error('Error fetching wallet:', error);
        // Fallback: try direct query
        const { data: walletData } = await supabase
          .from('nsh_wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        setWalletBalance(walletData?.balance || 0);
      } else {
        setWalletBalance(data || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
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
    if (!captures.front || !captures.back) {
      toast({ title: "Missing Images", description: "Please upload both front and back images", variant: "destructive" });
      return;
    }

    if (walletBalance < 50) {
      toast({ 
        title: "Insufficient Balance", 
        description: `You need 50 NSH coins. Current balance: ${walletBalance} NSH`, 
        variant: "destructive" 
      });
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
      const { data: paymentSuccess, error: payError } = await supabase.rpc('pay_for_auth_request', { amount: 50 });
      
      if (payError) {
        console.error('Payment error:', payError);
        throw new Error("Payment failed: " + payError.message);
      }
      
      if (!paymentSuccess) {
        throw new Error("Insufficient balance or payment failed");
      }

      // 3. Create Request with images as array
      const { data: request, error: reqError } = await supabase
        .from('auth_requests')
        .insert({
          user_id: user?.id,
          images: [frontUrl, backUrl], // Store as array
          status: 'pending',
          paid: true,
          paid_amount: 50
        })
        .select()
        .single();

      if (reqError) {
        console.error('Request creation error:', reqError);
        throw new Error("Failed to create request: " + reqError.message);
      }

      // Update wallet balance display
      await fetchWalletBalance();

      toast({ 
        title: "Payment Successful!", 
        description: "Request submitted. Waiting for expert assignment..." 
      });

      // Redirect to chat (thread will be created when expert is assigned)
      navigate(`/expert-chat/${request.id}`);

    } catch (error: any) {
      console.error('Error in payment/submit:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Something went wrong. Please try again.", 
        variant: "destructive" 
      });
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
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSourceSelector('front')}
                  className={cn(
                    "relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all overflow-hidden group",
                    captures.front 
                      ? "border-2 border-gold bg-gold/10 shadow-lg shadow-gold/30" 
                      : "border-2 border-dashed border-gold/40 hover:border-gold bg-card/50 hover:bg-gold/5"
                  )}
                >
                  {captures.front ? (
                    <>
                      <img src={captures.front} alt="Front" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-4 h-4 text-background" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                        <Camera className="w-8 h-8 text-gold" />
                      </div>
                      <span className="text-sm font-semibold text-gold">Front Side</span>
                      <span className="text-xs text-muted-foreground">Tap to capture</span>
                    </>
                  )}
                </motion.button>

                {/* Back Trigger */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSourceSelector('back')}
                  className={cn(
                    "relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all overflow-hidden group",
                    captures.back 
                      ? "border-2 border-gold bg-gold/10 shadow-lg shadow-gold/30" 
                      : "border-2 border-dashed border-gold/40 hover:border-gold bg-card/50 hover:bg-gold/5"
                  )}
                >
                  {captures.back ? (
                    <>
                      <img src={captures.back} alt="Back" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-4 h-4 text-background" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                        <Camera className="w-8 h-8 text-gold" />
                      </div>
                      <span className="text-sm font-semibold text-gold">Back Side</span>
                      <span className="text-xs text-muted-foreground">Tap to capture</span>
                    </>
                  )}
                </motion.button>
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

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-card border-2 border-gold/30 shadow-lg shadow-gold/20 text-center space-y-5"
              >
                <div>
                  <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Authentication Fee</p>
                  <p className="text-5xl font-serif font-bold gold-text">50 <span className="text-2xl">NSH</span></p>
                </div>

                <div className="bg-muted/50 p-4 rounded-xl border border-gold/20 flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Your Balance</span>
                  <div className="flex items-center gap-2">
                    <Wallet className={cn("w-4 h-4", walletBalance >= 50 ? "text-gold" : "text-red-400")} />
                    <span className={cn("font-bold text-lg", walletBalance >= 50 ? "text-gold" : "text-red-400")}>
                      {walletBalance} NSH
                    </span>
                  </div>
                </div>

                {walletBalance < 50 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full border-gold/50 text-gold hover:bg-gold/10" 
                      onClick={() => toast({ title: "Coming Soon", description: "Top-up feature is in development" })}
                    >
                      Top Up Wallet
                    </Button>
                  </motion.div>
                )}
              </motion.div>

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
