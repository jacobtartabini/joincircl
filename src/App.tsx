
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ClerkRequireAuth } from "@/components/guards/ClerkRequireAuth";
import MainLayout from "@/components/layout/MainLayout";
import Home from "@/pages/home";
import NotFound from "./pages/NotFound";

// Import redesigned pages
import RedesignedCircles from "@/pages/circles/RedesignedCircles";
import RedesignedContactDetail from "@/pages/contact/RedesignedContactDetail";

// Authentication pages - using custom pages
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import SSOCallback from "@/pages/auth/SSOCallback";

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

// User onboarding
import { UserOnboarding } from "./components/UserOnboarding";
import { ClerkAuthProvider } from "@/contexts/ClerkAuthContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes - using custom auth pages */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/sso-callback" element={<SSOCallback />} />
              
              {/* Legacy auth route redirects to custom pages */}
              <Route path="/auth/sign-in" element={<SignIn />} />
              <Route path="/auth/sign-up" element={<SignUp />} />

              {/* Protected routes */}
              <Route
                element={
                  <ClerkRequireAuth>
                    <MainLayout>
                      <Outlet />
                    </MainLayout>
                  </ClerkRequireAuth>
                }
              >
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                
                {/* Core application routes */}
                <Route path="/circles" element={<RedesignedCircles />} />
                <Route path="/contacts/:id" element={<RedesignedContactDetail />} />
                <Route path="/keystones" element={<Keystones />} />
                <Route path="/notifications" element={<Notifications />} />
                
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
      </ClerkAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
