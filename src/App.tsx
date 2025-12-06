import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Mobile Pages
import MobileHome from "./pages/mobile/MobileHome";
import MobileProfile from "./pages/mobile/MobileProfile";
import MobileMarketplace from "./pages/mobile/MobileMarketplace";
import MobileAuthenticate from "./pages/mobile/MobileAuthenticate";
import MobileMessages from "./pages/mobile/MobileMessages";
import MobileChatRoom from "./pages/mobile/MobileChatRoom";
import SellerDashboard from "./pages/mobile/SellerDashboard";
import MobileAuth from "./pages/mobile/MobileAuth";
import ProfileSetup from "./pages/mobile/ProfileSetup";
import MobileSettings from "./pages/mobile/MobileSettings";
import CoinDetail from "./pages/CoinDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<MobileHome />} />
              <Route path="/auth" element={<MobileAuth />} />
              <Route path="/marketplace" element={<MobileMarketplace />} />
              <Route path="/marketplace/coin/:id" element={<CoinDetail />} />
              
              {/* Protected routes */}
              <Route path="/profile/setup" element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              } />
              <Route path="/authenticate" element={
                <ProtectedRoute>
                  <MobileAuthenticate />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <MobileMessages />
                </ProtectedRoute>
              } />
              <Route path="/messages/:id" element={
                <ProtectedRoute>
                  <MobileChatRoom />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <MobileProfile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MobileSettings />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/seller" element={
                <ProtectedRoute>
                  <SellerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
