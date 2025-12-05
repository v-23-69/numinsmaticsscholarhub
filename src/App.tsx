import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Mobile Pages
import MobileHome from "./pages/mobile/MobileHome";
import MobileProfile from "./pages/mobile/MobileProfile";
import MobileMarketplace from "./pages/mobile/MobileMarketplace";
import MobileAuthenticate from "./pages/mobile/MobileAuthenticate";
import MobileMessages from "./pages/mobile/MobileMessages";
import MobileChatRoom from "./pages/mobile/MobileChatRoom";
import SellerDashboard from "./pages/mobile/SellerDashboard";
import CoinDetail from "./pages/CoinDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MobileHome />} />
          <Route path="/marketplace" element={<MobileMarketplace />} />
          <Route path="/marketplace/coin/:id" element={<CoinDetail />} />
          <Route path="/authenticate" element={<MobileAuthenticate />} />
          <Route path="/messages" element={<MobileMessages />} />
          <Route path="/messages/:id" element={<MobileChatRoom />} />
          <Route path="/profile" element={<MobileProfile />} />
          <Route path="/dashboard/seller" element={<SellerDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
