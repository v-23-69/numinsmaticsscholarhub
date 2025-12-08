import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, Image, ArrowLeft, X, Upload, Check, 
  Zap, MessageCircle, CreditCard, Wallet, ChevronRight, Shield, Star, Play
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PremiumNavBar } from "@/components/mobile/PremiumNavBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Step = "intro" | "capture" | "review" | "payment" | "success";

export default function MobileAuthenticate() {
  const [step, setStep] = useState<Step>("intro");
  const [captures, setCaptures] = useState<{ front?: string; back?: string }>({});
  const [freeQuota] = useState({ used: 2, total: 5 }); // 2 of 5 free pairs used
  const [walletBalance] = useState(150); // ₹150 NSH Coins
  const navigate = useNavigate();
  const { toast } = useToast();

  const quotaRemaining = freeQuota.total - freeQuota.used;
  const isFreeUpload = quotaRemaining > 0;

  const handleCapture = (side: "front" | "back") => {
    // Mock capture with coin image
    setCaptures((prev) => ({
      ...prev,
      [side]: `https://images.unsplash.com/photo-1621264448270-9ef00e88a935?w=400&h=400&fit=crop`,
    }));
  };

  const handleSubmit = () => {
    if (isFreeUpload) {
      setStep("success");
    } else {
      setStep("payment");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40 safe-area-inset-top">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="flex items-center h-14 px-4">
          {step !== "intro" ? (
            <button onClick={() => setStep("intro")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link to="/" className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <span className="flex-1 text-center font-serif font-semibold">
            {step === "intro" && "Expert Authentication"}
            {step === "capture" && "Capture Images"}
            {step === "review" && "Review & Submit"}
            {step === "payment" && "Payment"}
            {step === "success" && "Submitted"}
          </span>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Intro Step */}
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Quota & Wallet Card */}
              <div className="card-gold-trim p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Free Uploads</p>
                    <p className="text-2xl font-serif font-bold text-gold">
                      {quotaRemaining}/{freeQuota.total}
                    </p>
                    <p className="text-xs text-muted-foreground">pairs remaining</p>
                  </div>
                  <div className="w-20 h-20 relative">
                    {/* Circular progress */}
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="6"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="hsl(var(--gold))"
                        strokeWidth="6"
                        strokeDasharray={`${(quotaRemaining / freeQuota.total) * 220} 220`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-gold" />
                    </div>
                  </div>
                </div>
                
                <div className="divider-gold" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-gold" />
                    <span className="text-sm">NSH Wallet</span>
                  </div>
                  <span className="font-bold">₹{walletBalance}</span>
                </div>
              </div>

              {/* Pricing Info */}
              <div className="space-y-3">
                <h2 className="font-serif font-semibold text-lg">Pricing</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="card-museum p-4 text-center">
                    <p className="text-2xl font-serif font-bold text-gold">Free</p>
                    <p className="text-xs text-muted-foreground mt-1">First 5 coin pairs</p>
                  </div>
                  <div className="card-museum p-4 text-center">
                    <p className="text-2xl font-serif font-bold">₹49</p>
                    <p className="text-xs text-muted-foreground mt-1">Per pair after</p>
                  </div>
                </div>
                <div className="card-gold-trim p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Video Consultation</p>
                    <p className="text-xs text-muted-foreground">15 min with expert</p>
                  </div>
                  <span className="text-lg font-bold text-gold">₹199</span>
                </div>
              </div>

              {/* How it works */}
              <div className="space-y-3">
                <h2 className="font-serif font-semibold text-lg">How It Works</h2>
                <div className="space-y-2">
                  {[
                    { icon: Camera, title: "Capture", desc: "Take photos of front & back", step: 1 },
                    { icon: Upload, title: "Submit", desc: "Upload for expert review", step: 2 },
                    { icon: MessageCircle, title: "Chat", desc: "Discuss with assigned expert", step: 3 },
                    { icon: Check, title: "Get Report", desc: "Receive authenticity certificate", step: 4 },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border/50">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-gold" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">Step {item.step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Button
                className="w-full btn-gold rounded-xl h-14 text-base font-semibold"
                onClick={() => setStep("capture")}
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Authentication
              </Button>
            </motion.div>
          )}

          {/* Capture Step */}
          {step === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <p className="text-center text-muted-foreground">
                Capture clear images of both sides
              </p>

              {/* Capture Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Front */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCapture("front")}
                  className={cn(
                    "relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all overflow-hidden",
                    captures.front
                      ? "border-gold bg-gold/5"
                      : "border-gold/40 hover:border-gold"
                  )}
                >
                  {captures.front ? (
                    <>
                      <img
                        src={captures.front}
                        alt="Front"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-gold/90 text-[10px] font-semibold text-primary-foreground">
                        FRONT
                      </div>
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Gold-trimmed camera frame overlay */}
                      <div className="absolute inset-4 border-2 border-gold/30 rounded-xl pointer-events-none" />
                      <Camera className="w-10 h-10 text-gold" />
                      <span className="text-sm font-medium">Front Side</span>
                    </>
                  )}
                </motion.button>

                {/* Back */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCapture("back")}
                  className={cn(
                    "relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all overflow-hidden",
                    captures.back
                      ? "border-gold bg-gold/5"
                      : "border-gold/40 hover:border-gold"
                  )}
                >
                  {captures.back ? (
                    <>
                      <img
                        src={captures.back}
                        alt="Back"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-gold/90 text-[10px] font-semibold text-primary-foreground">
                        BACK
                      </div>
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-4 border-2 border-gold/30 rounded-xl pointer-events-none" />
                      <Camera className="w-10 h-10 text-gold" />
                      <span className="text-sm font-medium">Back Side</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Gallery Option */}
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gold/30 text-gold">
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
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Front</p>
                  <div className="relative rounded-xl overflow-hidden border border-gold/30">
                    <img
                      src={captures.front}
                      alt="Front"
                      className="aspect-square object-cover w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Back</p>
                  <div className="relative rounded-xl overflow-hidden border border-gold/30">
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
                  ? "bg-gold/10 border-gold/30" 
                  : "bg-muted border-border"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {isFreeUpload ? (
                    <>
                      <Zap className="w-5 h-5 text-gold" />
                      <span className="font-medium text-gold">Free Authentication</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span className="font-medium">Payment Required</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isFreeUpload 
                    ? `You have ${quotaRemaining} free uploads remaining. This authentication is free!`
                    : `Upload fee: ₹49. You have ₹${walletBalance} in your NSH Wallet.`
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-12 border-gold/40"
                  onClick={() => setStep("capture")}
                >
                  Retake
                </Button>
                <Button
                  className="flex-1 btn-gold rounded-xl h-12"
                  onClick={handleSubmit}
                >
                  {isFreeUpload ? "Submit" : "Pay & Submit"}
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
              <div className="card-gold-trim p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Authentication Fee</p>
                <p className="text-3xl font-serif font-bold">₹49</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Pay with</h3>
                
                <button className="w-full p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-6 h-6 text-gold" />
                    <div className="text-left">
                      <p className="font-medium">NSH Wallet</p>
                      <p className="text-xs text-muted-foreground">Balance: ₹{walletBalance}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <button className="w-full p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6" />
                    <div className="text-left">
                      <p className="font-medium">Credit/Debit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <Button
                className="w-full btn-gold rounded-xl h-14"
                onClick={() => setStep("success")}
              >
                Pay ₹49
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
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-10 h-10 text-gold" />
                </motion.div>
                <h2 className="font-serif font-semibold text-2xl mb-2">Submitted!</h2>
                <p className="text-muted-foreground">
                  Your coin is being reviewed. An expert will message you shortly.
                </p>
              </div>

              {/* Expert Card */}
              <div className="card-gold-trim p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="story-ring w-14 h-14">
                    <img
                      src="https://i.pravatar.cc/150?img=12"
                      alt="Expert"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-serif font-semibold">Dr. Anand Kumar</p>
                    <p className="text-xs text-muted-foreground">Mughal Specialist • 15+ years</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-gold fill-gold" />
                      <span className="text-xs">4.9</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Estimated response time: <strong className="text-foreground">2-4 hours</strong>
                </p>
                <Link to="/messages">
                  <Button className="w-full btn-gold rounded-xl h-12">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Open Expert Chat
                  </Button>
                </Link>
              </div>

              <Button
                variant="outline"
                className="w-full rounded-xl h-12 border-gold/40"
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
