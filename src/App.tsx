
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { RequireAuth } from "@/components/guards/RequireAuth";
import MainLayout from "@/components/layout/MainLayout";
import Home from "@/pages/home";
import NotFound from "./pages/NotFound";

// Import redesigned pages
import RedesignedCircles from "@/pages/circles/RedesignedCircles";
import RedesignedContactDetail from "@/pages/contact/RedesignedContactDetail";

// Authentication pages
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import CallbackPage from "./pages/CallbackPage";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";

// Special pages
import Settings from "@/pages/Settings";
import Keystones from "@/pages/Keystones";
import Notifications from "@/pages/Notifications";
import Help from "@/pages/Help";
import Bugs from "@/pages/Bugs";
import Legal from "@/pages/Legal";
import ShareTarget from "@/pages/ShareTarget";
import SecurityGuide from "@/pages/SecurityGuide";
import Duplicates from "@/pages/Duplicates";
import Contact from "@/pages/Contact";
import AIAssistant from "@/pages/AIAssistant";

// User onboarding
import { UserOnboarding } from "./components/UserOnboarding";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth/sign-in" element={<SignIn />} />
              <Route path="/auth/sign-up" element={<SignUp />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<CallbackPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

              {/* Protected routes */}
              <Route
                element={
                  <RequireAuth>
                    <MainLayout>
                      <Outlet />
                    </MainLayout>
                  </RequireAuth>
                }
              >
                <Route path="/" element={<Home />} />
                
                {/* Core application routes */}
                <Route path="/circles" element={<RedesignedCircles />} />
                <Route path="/contacts/:id" element={<RedesignedContactDetail />} />
                <Route path="/keystones" element={<Keystones />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                
                {/* Settings and management */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/duplicates" element={<Duplicates />} />
                
                {/* Support and information */}
                <Route path="/help" element={<Help />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/bugs" element={<Bugs />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/security" element={<SecurityGuide />} />
                
                {/* PWA functionality */}
                <Route path="/share-target" element={<ShareTarget />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <UserOnboarding />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
