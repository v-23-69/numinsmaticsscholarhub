import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, Image, ArrowLeft, X, Upload, Check, 
  Zap, MessageCircle, CreditCard
} from "lucide-react";
import { Link } from "react-router-dom";
import { MobileNavBar } from "@/components/mobile/MobileNavBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = "intro" | "capture" | "review" | "payment" | "chat";

export default function MobileAuthenticate() {
  const [step, setStep] = useState<Step>("intro");
  const [captures, setCaptures] = useState<{ front?: string; back?: string }>({});
  const [freeQuota] = useState(8); // Mock: 8 of 10 free images remaining

  const handleCapture = (side: "front" | "back") => {
    // Mock capture
    setCaptures((prev) => ({
      ...prev,
      [side]: `https://images.unsplash.com/photo-1621264448270-9ef00e88a935?w=400&h=400&fit=crop`,
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/40 safe-area-inset-top">
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
            {step === "intro" && "Authenticate Coin"}
            {step === "capture" && "Capture Images"}
            {step === "review" && "Review Images"}
            {step === "payment" && "Payment"}
            {step === "chat" && "Expert Chat"}
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
              {/* Quota Card */}
              <div className="p-4 rounded-2xl bg-gradient-card border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Free Authentication</span>
                  <span className="text-sm text-muted-foreground">
                    {freeQuota}/10 images left
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-gold rounded-full"
                    style={{ width: `${(freeQuota / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  First 5 coin pairs (10 images) free! Each coin needs front + back.
                </p>
              </div>

              {/* How it works */}
              <div className="space-y-4">
                <h2 className="font-serif font-semibold text-lg">How It Works</h2>
                <div className="space-y-3">
                  {[
                    { icon: Camera, title: "Capture", desc: "Take clear photos of front & back" },
                    { icon: Upload, title: "Upload", desc: "Submit for expert review" },
                    { icon: MessageCircle, title: "Chat", desc: "Discuss with assigned expert" },
                    { icon: Check, title: "Get Certified", desc: "Receive authenticity report" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-card border border-border/50">
                      <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-emerald" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <h2 className="font-serif font-semibold text-lg">Pricing</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                    <p className="text-2xl font-serif font-bold text-gold">Free</p>
                    <p className="text-xs text-muted-foreground mt-1">First 5 coins</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                    <p className="text-2xl font-serif font-bold">₹49</p>
                    <p className="text-xs text-muted-foreground mt-1">Per coin after</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gold/10 border border-gold/20 text-center">
                  <p className="text-lg font-serif font-bold text-gold-dark">₹199</p>
                  <p className="text-xs text-muted-foreground mt-1">Video consultation (15 min)</p>
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
                <button
                  onClick={() => handleCapture("front")}
                  className={cn(
                    "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all",
                    captures.front
                      ? "border-emerald bg-emerald/5"
                      : "border-border hover:border-primary"
                  )}
                >
                  {captures.front ? (
                    <>
                      <img
                        src={captures.front}
                        alt="Front"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Front Side</span>
                    </>
                  )}
                </button>

                {/* Back */}
                <button
                  onClick={() => handleCapture("back")}
                  className={cn(
                    "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all",
                    captures.back
                      ? "border-emerald bg-emerald/5"
                      : "border-border hover:border-primary"
                  )}
                >
                  {captures.back ? (
                    <>
                      <img
                        src={captures.back}
                        alt="Back"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Back Side</span>
                    </>
                  )}
                </button>
              </div>

              {/* Gallery Option */}
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-muted-foreground">
                <Image className="w-5 h-5" />
                Choose from Gallery
              </button>

              {/* Tips */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <h3 className="font-medium text-sm mb-2">Tips for best results:</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use good lighting, avoid shadows</li>
                  <li>• Keep camera steady and close</li>
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
                  <img
                    src={captures.front}
                    alt="Front"
                    className="aspect-square rounded-xl object-cover w-full"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Back</p>
                  <img
                    src={captures.back}
                    alt="Back"
                    className="aspect-square rounded-xl object-cover w-full"
                  />
                </div>
              </div>

              {/* Info Card */}
              <div className="p-4 rounded-xl bg-emerald/10 border border-emerald/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-emerald" />
                  <span className="font-medium text-emerald">Free Authentication</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You have {freeQuota} free image slots remaining. This authentication is free!
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-12"
                  onClick={() => setStep("capture")}
                >
                  Retake
                </Button>
                <Button
                  className="flex-1 btn-gold rounded-xl h-12"
                  onClick={() => setStep("chat")}
                >
                  Submit
                </Button>
              </div>
            </motion.div>
          )}

          {/* Chat Step */}
          {step === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald" />
                </div>
                <h2 className="font-serif font-semibold text-xl mb-2">Submitted!</h2>
                <p className="text-muted-foreground">
                  Your coin is being reviewed. An expert will message you shortly.
                </p>
              </div>

              {/* Expert Card */}
              <div className="p-4 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src="https://i.pravatar.cc/150?img=12"
                    alt="Expert"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">Dr. Anand Kumar</p>
                    <p className="text-xs text-muted-foreground">Mughal Specialist • 15+ years</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Estimated response time: 2-4 hours
                </p>
                <Link to="/messages">
                  <Button className="w-full btn-primary rounded-xl">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Open Chat
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileNavBar />
    </div>
  );
}
