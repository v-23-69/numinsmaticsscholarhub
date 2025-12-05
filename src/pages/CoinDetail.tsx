import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Share2,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShoppingCart,
  Truck,
  Lock,
  Award,
  Eye,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import coinMughalFront from "@/assets/coin-mughal-front.jpg";
import coinBritishFront from "@/assets/coin-british-front.jpg";
import coinSultanateFront from "@/assets/coin-sultanate-front.jpg";
import coinAncientFront from "@/assets/coin-ancient-front.jpg";

// Mock coin data
const coinData = {
  id: "1",
  title: "Mughal Empire Gold Mohur - Shah Jahan Period",
  era: "Mughal India",
  year: "1628-1658 CE",
  price: 285000,
  images: [
    coinMughalFront,
    coinBritishFront,
    coinSultanateFront,
    coinAncientFront,
  ],
  seller: {
    name: "Heritage Coins",
    avatar: "https://i.pravatar.cc/150?img=10",
    trustScore: 4.9,
    totalSales: 1240,
    memberSince: "2018",
    verified: true,
  },
  isVerified: true,
  condition: "Extremely Fine (EF)",
  metal: "Gold",
  weight: "10.95g",
  diameter: "21mm",
  mint: "Agra",
  description: `A magnificent gold mohur from the reign of Shah Jahan, the fifth Mughal emperor renowned for building the Taj Mahal. This specimen displays exceptional preservation with sharp details on both obverse and reverse.

The obverse features the Persian inscription with the emperor's name and titles, while the reverse shows the mint name, regnal year, and the Hijri date. The coin exhibits a beautiful honey-gold patina developed over centuries.

This piece comes with detailed provenance documentation and has been authenticated by our team of experts.`,
  provenance: [
    "Private European Collection (1920s-2010)",
    "Heritage Auctions, New York (2015)",
    "Current seller acquisition (2018)",
  ],
  tags: ["Gold", "Mughal", "Shah Jahan", "Mohur", "Agra Mint", "17th Century"],
  views: 1234,
  wishlists: 89,
  stock: 1,
};

const CoinDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === coinData.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? coinData.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4 md:py-6">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/marketplace"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <section className="container pb-12 md:pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-light/30 border border-border/50">
                <img
                  src={coinData.images[currentImageIndex]}
                  alt={coinData.title}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Badges */}
                {coinData.isVerified && (
                  <div className="absolute top-4 left-4">
                    <span className="badge-verified flex items-center gap-1 text-sm px-3 py-1">
                      <Shield className="w-4 h-4" />
                      Expert Verified
                    </span>
                  </div>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-charcoal/70 text-primary-foreground text-sm">
                  {currentImageIndex + 1} / {coinData.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto scrollbar-elegant pb-2">
                {coinData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      currentImageIndex === index
                        ? "border-primary"
                        : "border-border/50 opacity-70 hover:opacity-100"
                    )}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-gold/10 text-gold-dark border-gold/20">
                    {coinData.era}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{coinData.year}</span>
                </div>
                <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  {coinData.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {coinData.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {coinData.wishlists} wishlists
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="p-6 rounded-2xl bg-gradient-card border border-border/50">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <p className="text-3xl md:text-4xl font-serif font-bold text-gold-dark">
                      {formatPrice(coinData.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald font-medium">
                      {coinData.stock} in stock
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="flex-1 btn-gold rounded-xl h-14 text-base font-semibold">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className={cn(
                      "rounded-xl h-14",
                      isWishlisted && "bg-accent/10 border-accent text-accent"
                    )}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart
                      className={cn("w-5 h-5", isWishlisted && "fill-current")}
                    />
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-xl h-14">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-3 rounded-xl bg-card border border-border/50 text-center">
                  <Lock className="w-5 h-5 text-emerald mb-2" />
                  <span className="text-xs font-medium">Secure Escrow</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-card border border-border/50 text-center">
                  <Shield className="w-5 h-5 text-emerald mb-2" />
                  <span className="text-xs font-medium">Expert Verified</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-card border border-border/50 text-center">
                  <Truck className="w-5 h-5 text-emerald mb-2" />
                  <span className="text-xs font-medium">Insured Shipping</span>
                </div>
              </div>

              {/* Seller Card */}
              <div className="p-5 rounded-2xl bg-card border border-border/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={coinData.seller.avatar}
                        alt={coinData.seller.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      {coinData.seller.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald flex items-center justify-center">
                          <Award className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {coinData.seller.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-medium">{coinData.seller.trustScore}</span>
                        <span className="text-muted-foreground">
                          · {coinData.seller.totalSales} sales
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Since {coinData.seller.memberSince}
                  </span>
                </div>
                <Button variant="outline" className="w-full rounded-xl">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {coinData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tabs Section */}
          <div className="mt-12">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start border-b border-border/60 rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="details"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="provenance"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  Provenance
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="pt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-serif font-semibold text-lg mb-4">Description</h3>
                    <div className="prose prose-sm text-muted-foreground whitespace-pre-line">
                      {coinData.description}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-lg mb-4">Specifications</h3>
                    <dl className="space-y-3">
                      {[
                        { label: "Condition", value: coinData.condition },
                        { label: "Metal", value: coinData.metal },
                        { label: "Weight", value: coinData.weight },
                        { label: "Diameter", value: coinData.diameter },
                        { label: "Mint", value: coinData.mint },
                        { label: "Period", value: coinData.year },
                      ].map((spec) => (
                        <div
                          key={spec.label}
                          className="flex items-center justify-between py-2 border-b border-border/40"
                        >
                          <dt className="text-muted-foreground">{spec.label}</dt>
                          <dd className="font-medium">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="provenance" className="pt-6">
                <h3 className="font-serif font-semibold text-lg mb-4">Ownership History</h3>
                <div className="space-y-4">
                  {coinData.provenance.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-gold-dark">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-muted-foreground pt-1">{item}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  <p>No reviews yet for this coin.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CoinDetail;
