import { Shield, Lock, Award } from "lucide-react";

export function TrustBadge() {
  return (
    <section className="px-4 py-4 border-b border-border/40">
      <div className="flex items-center justify-center gap-6 py-3 px-4 rounded-xl bg-gradient-emerald text-primary-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-medium">Expert Verified</span>
        </div>
        <div className="w-px h-4 bg-primary-foreground/30" />
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-medium">Secure Escrow</span>
        </div>
        <div className="w-px h-4 bg-primary-foreground/30" />
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4" />
          <span className="text-xs font-medium">Trusted Sellers</span>
        </div>
      </div>
    </section>
  );
}
