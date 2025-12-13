import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import { SwipeContainer } from "@/components/mobile/SwipeContainer";

// Mobile Pages
import MobileHome from "./pages/mobile/MobileHome";
import MobileProfile from "./pages/mobile/MobileProfile";
import MobileMarketplace from "./pages/mobile/MobileMarketplace";
import MobileAuthenticate from "./pages/mobile/MobileAuthenticate";
import MobileMessages from "./pages/mobile/MobileMessages";
import MobileChatRoom from "./pages/mobile/MobileChatRoom";
import SellerDashboard from "./pages/mobile/SellerDashboard";
import MobileAuth from "./pages/mobile/MobileAuth";
import MobileSell from "./pages/mobile/MobileSell";
import MobileExpertChat from "./pages/mobile/MobileExpertChat";
import ProfileSetup from "./pages/mobile/ProfileSetup";
import MobileSettings from "./pages/mobile/MobileSettings";
import CoinDetail from "./pages/CoinDetail";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StoriesManager from "./pages/admin/stories/StoriesManager";
import FeedManager from "./pages/admin/feed/FeedManager";
import FeaturedCoinsManager from "./pages/admin/coins/FeaturedCoinsManager";
import ExpertAuthDashboard from "./pages/admin/auth/ExpertAuthDashboard";
import UserManager from "./pages/admin/users/UserManager";
import ShopifySyncManager from "./pages/admin/shopify/ShopifySyncManager";
import DiscountManager from "./pages/admin/commerce/DiscountManager";
import AdminOrderDashboard from "./pages/admin/commerce/AdminOrderDashboard";
import AdminSettings from "./pages/admin/settings/AdminSettings";

const queryClient = new QueryClient();

// Wrapper component for swipe navigation on main pages
function AppRoutes() {
  const location = useLocation();
  const swipePages = ["/", "/marketplace", "/authenticate", "/profile"];
  const isSwipePage = swipePages.includes(location.pathname);

  const content = (
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
      <Route path="/sell" element={
        <ProtectedRoute>
          <MobileSell />
        </ProtectedRoute>
      } />


      <Route path="/expert-chat/:id" element={
        <ProtectedRoute>
          <MobileExpertChat />
        </ProtectedRoute>
      } />

      {/* Admin Routes - Strictly Secured */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="stories" element={<StoriesManager />} />
        <Route path="feed" element={<FeedManager />} />
        <Route path="featured" element={<FeaturedCoinsManager />} />
        <Route path="experts" element={<ExpertAuthDashboard />} />
        <Route path="users" element={<UserManager />} />
        <Route path="discounts" element={<DiscountManager />} />
        <Route path="orders" element={<AdminOrderDashboard />} />
        <Route path="shopify" element={<ShopifySyncManager />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-background">
      {content}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
