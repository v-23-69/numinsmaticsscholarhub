import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, Image, ArrowLeft, Check, 
  Zap, MessageCircle, Wallet, Shield, Star
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PremiumNavBar } from "@/components/mobile/PremiumNavBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Step = "capture" | "review" | "payment" | "success";

export default function MobileAuthenticate() {
  const [step, setStep] = useState<Step>("capture");
  const [captures, setCaptures] = useState<{ front?: string; back?: string }>({});
  const [freeQuota] = useState({ used: 2, total: 5 });
  const [walletBalance] = useState(150);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const quotaRemaining = freeQuota.total - freeQuota.used;
  const isFreeUpload = quotaRemaining > 0;

  const handleCapture = (side: "front" | "back") => {
    setCaptures((prev) => ({
      ...prev,
      [side]: `https://images.unsplash.com/photo-1621264448270-9ef00e88a935?w=400&h=400&fit=crop`,
    }));
  };

  const handleSubmit = () => {
    if (isFreeUpload) {
      setIsPaid(true);
      setStep("success");
    } else {
      setStep("payment");
    }
  };

  const handlePayment = () => {
    toast({
      title: "Payment Successful",
      description: "₹49 deducted from NSH Wallet",
    });
    setIsPaid(true);
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-gold/20 safe-area-inset-top">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="flex items-center h-14 px-4">
          {step === "capture" ? (
            <Link to="/" className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          ) : (
            <button onClick={() => setStep("capture")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="flex-1 text-center font-serif font-semibold gold-text">
            Expert Authentication
          </span>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-4 py-4">
        <AnimatePresence mode="wait">
          {/* Capture Step - Direct Entry */}
          {step === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {/* Compact Quota & Wallet Row */}
              <div className="flex gap-3">
                {/* Free Uploads */}
                <div className="flex-1 p-3 rounded-xl bg-card border border-gold/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Free Uploads</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-serif font-bold text-gold">{quotaRemaining}</span>
                        <span className="text-sm text-muted-foreground">/{freeQuota.total}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">pairs remaining</p>
                    </div>
                    <div className="w-12 h-12 relative">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                        <circle
                          cx="24" cy="24" r="20" fill="none"
                          stroke="hsl(var(--gold))"
                          strokeWidth="4"
                          strokeDasharray={`${(quotaRemaining / freeQuota.total) * 126} 126`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <Shield className="absolute inset-0 m-auto w-4 h-4 text-gold" />
                    </div>
                  </div>
                </div>

                {/* NSH Wallet */}
                <div className="w-28 p-3 rounded-xl bg-card border border-gold/30">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">NSH Wallet</p>
                  <p className="text-xl font-serif font-bold text-gold mt-1">₹{walletBalance}</p>
                </div>
              </div>

              {/* Capture Title */}
              <div className="text-center py-2">
                <h2 className="font-serif font-semibold text-lg">Capture Coin Images</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Take clear photos of both sides
                </p>
              </div>

              {/* Capture Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Front */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCapture("front")}
                  className={cn(
                    "relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all overflow-hidden",
                    captures.front
                      ? "border-2 border-gold bg-gold/5"
                      : "border-2 border-dashed border-gold/40 hover:border-gold bg-card/50"
                  )}
                >
                  {captures.front ? (
                    <>
                      <img
                        src={captures.front}
                        alt="Front"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-gold/90 text-[10px] font-semibold text-background">
                        FRONT
                      </div>
                      <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-gold flex items-center justify-center">
                        <Check className="w-4 h-4 text-background" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-3 border border-gold/20 rounded-xl pointer-events-none" />
                      <Camera className="w-10 h-10 text-gold" />
                      <span className="text-sm font-medium text-gold">Front Side</span>
                    </>
                  )}
                </motion.button>

                {/* Back */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCapture("back")}
                  className={cn(
                    "relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all overflow-hidden",
                    captures.back
                      ? "border-2 border-gold bg-gold/5"
                      : "border-2 border-dashed border-gold/40 hover:border-gold bg-card/50"
                  )}
                >
                  {captures.back ? (
                    <>
                      <img
                        src={captures.back}
                        alt="Back"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-gold/90 text-[10px] font-semibold text-background">
                        BACK
                      </div>
                      <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-gold flex items-center justify-center">
                        <Check className="w-4 h-4 text-background" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-3 border border-gold/20 rounded-xl pointer-events-none" />
                      <Camera className="w-10 h-10 text-gold" />
                      <span className="text-sm font-medium text-gold">Back Side</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Gallery Option */}
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gold/30 text-gold bg-card/50 hover:bg-gold/10 transition-colors">
                <Image className="w-5 h-5" />
                Choose from Gallery
              </button>

              {/* Tips */}
              <div className="p-4 rounded-xl bg-card border border-border/50">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold" />
                  Tips for best results
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>• Use natural lighting, avoid harsh shadows</li>
                  <li>• Keep camera steady and close to coin</li>
                  <li>• Capture full coin with edges visible</li>
                  <li>• Avoid reflections on shiny surfaces</li>
                </ul>
              </div>

              {/* Continue */}
              <Button
                className="w-full btn-gold rounded-xl h-14"
                disabled={!captures.front || !captures.back}
                onClick={() => setStep("review")}
              >
                Continue to Review
              </Button>
            </motion.div>
          )}

          {/* Review Step */}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              <h2 className="font-serif font-semibold text-lg text-center">Review Images</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center text-gold">Front</p>
                  <div className="relative rounded-xl overflow-hidden border-2 border-gold/40">
                    <img
                      src={captures.front}
                      alt="Front"
                      className="aspect-square object-cover w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center text-gold">Back</p>
                  <div className="relative rounded-xl overflow-hidden border-2 border-gold/40">
                    <img
                      src={captures.back}
                      alt="Back"
                      className="aspect-square object-cover w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className={cn(
                "p-4 rounded-xl border",
                isFreeUpload 
                  ? "bg-gold/10 border-gold/40" 
                  : "bg-card border-border"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {isFreeUpload ? (
                    <>
                      <Zap className="w-5 h-5 text-gold" />
                      <span className="font-medium text-gold">Free Authentication</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 text-gold" />
                      <span className="font-medium">Pay with NSH Wallet</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isFreeUpload 
                    ? `You have ${quotaRemaining} free uploads remaining. This is free!`
                    : `Fee: ₹49 • Wallet Balance: ₹${walletBalance}`
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-12 border-gold/40 hover:bg-gold/10"
                  onClick={() => setStep("capture")}
                >
                  Retake
                </Button>
                <Button
                  className="flex-1 btn-gold rounded-xl h-12"
                  onClick={handleSubmit}
                >
                  {isFreeUpload ? "Submit" : "Pay ₹49 & Submit"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Payment Step */}
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center py-4">
                <h2 className="font-serif font-semibold text-xl">Payment</h2>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-gold/30 text-center">
                <p className="text-sm text-muted-foreground mb-2">Authentication Fee</p>
                <p className="text-4xl font-serif font-bold text-gold">₹49</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Pay with NSH Wallet</h3>
                
                <button
                  onClick={handlePayment}
                  className="w-full p-4 rounded-xl bg-gold/10 border-2 border-gold flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-gold" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gold">NSH Wallet</p>
                      <p className="text-xs text-muted-foreground">Balance: ₹{walletBalance}</p>
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-gold" />
                </button>
              </div>

              <Button
                className="w-full btn-gold rounded-xl h-14"
                onClick={handlePayment}
              >
                Pay ₹49 with NSH Wallet
              </Button>
            </motion.div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4 border-2 border-gold"
                >
                  <Check className="w-10 h-10 text-gold" />
                </motion.div>
                <h2 className="font-serif font-semibold text-2xl gold-text mb-2">Success!</h2>
                <p className="text-muted-foreground">
                  Your coin images have been submitted for expert review.
                </p>
              </div>

              {/* Expert Card */}
              <div className="p-5 rounded-2xl bg-card border border-gold/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="story-ring w-16 h-16">
                    <img
                      src="https://i.pravatar.cc/150?img=12"
                      alt="Expert"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-serif font-semibold text-lg">Dr. Anand Kumar</p>
                    <p className="text-sm text-muted-foreground">Mughal Specialist • 15+ years</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-gold fill-gold" />
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Estimated response time: <strong className="text-foreground">2-4 hours</strong>
                  </p>
                </div>
                
                {isPaid ? (
                  <Link to="/messages/expert-1">
                    <Button className="w-full btn-gold rounded-xl h-14">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Connect with Expert
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full rounded-xl h-14 bg-muted text-muted-foreground">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Pay to Access Chat
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full rounded-xl h-12 border-gold/40 hover:bg-gold/10"
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <PremiumNavBar />
    </div>
  );
}
