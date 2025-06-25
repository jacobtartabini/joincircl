
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { RequireAuth } from "@/components/guards/RequireAuth";
import MainLayout from "@/components/layout/MainLayout";
import Home from "@/pages/home";
import NotFound from "./pages/NotFound";
import Onboarding from "@/pages/Onboarding";

// Import circles index component that handles mobile detection
import Circles from "@/pages/circles";
import RedesignedContactDetail from "@/pages/contact/RedesignedContactDetail";

// Authentication pages
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import UnifiedAuthCallbackHandler from "@/components/auth/UnifiedAuthCallbackHandler";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

// Special pages
import Settings from "@/pages/Settings";
import Notifications from "@/pages/Notifications";
import Help from "@/pages/Help";
import Bugs from "@/pages/Bugs";
import Legal from "@/pages/Legal";
import ShareTarget from "@/pages/ShareTarget";
import SecurityGuide from "@/pages/SecurityGuide";
import Duplicates from "@/pages/Duplicates";
import Contact from "@/pages/Contact";
import Arlo from "@/pages/Arlo";
import CareerHub from "@/pages/CareerHub";
import Events from "@/pages/Events";

// Career tool pages
import ResumeReviewer from "@/pages/career/ResumeReviewer";
import CoverLetterGenerator from "@/pages/career/CoverLetterGenerator";
import JobAnalyzer from "@/pages/career/JobAnalyzer";
import NetworkDiscovery from "@/pages/career/NetworkDiscovery";
import InterviewerResearch from "@/pages/career/InterviewerResearch";
import CompanyResearch from "@/pages/career/CompanyResearch";
import MockInterview from "@/pages/career/MockInterview";
import FollowUpGenerator from "@/pages/career/FollowUpGenerator";
import OfferComparison from "@/pages/career/OfferComparison";
import SkillGapAnalysis from "@/pages/career/SkillGapAnalysis";

import { AuthProvider } from "@/contexts/AuthContext";
import { DemoAuthProvider } from "@/contexts/DemoAuthContext";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { DemoWrapper } from "@/components/demo/DemoWrapper";
import { useEffect } from "react";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Pre-initialize MSW if we're starting on a demo route
    if (window.location.pathname.startsWith('/demo')) {
      import('@/lib/demo/setupMockWorker').then(({ initializeDemoMode }) => {
        initializeDemoMode().catch(console.error);
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthErrorBoundary>
            <Routes>
              {/* Demo routes - self-contained sandbox */}
              <Route path="/demo" element={<DemoWrapper />}>
                <Route index element={<Home />} />
                <Route path="circles" element={<Circles />} />
                <Route path="contact/:id" element={<RedesignedContactDetail />} />
                <Route path="events" element={<Events />} />
                <Route path="arlo" element={<Arlo />} />
                <Route path="career" element={<CareerHub />} />
                <Route path="career/resume" element={<ResumeReviewer />} />
                <Route path="career/coverLetter" element={<CoverLetterGenerator />} />
                <Route path="career/jobAnalyzer" element={<JobAnalyzer />} />
                <Route path="career/networkDiscovery" element={<NetworkDiscovery />} />
                <Route path="career/interviewerResearch" element={<InterviewerResearch />} />
                <Route path="career/companyResearch" element={<CompanyResearch />} />
                <Route path="career/mockInterview" element={<MockInterview />} />
                <Route path="career/followUp" element={<FollowUpGenerator />} />
                <Route path="career/offerCompare" element={<OfferComparison />} />
                <Route path="career/skillGap" element={<SkillGapAnalysis />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Regular production routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot" element={<ForgotPassword />} />
              <Route path="/reset" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<UnifiedAuthCallbackHandler />} />
              <Route path="/auth/google/callback" element={<UnifiedAuthCallbackHandler />} />

              {/* Onboarding route - protected but separate from main layout */}
              <Route
                path="/onboarding"
                element={
                  <AuthProvider>
                    <RequireAuth>
                      <Onboarding />
                    </RequireAuth>
                  </AuthProvider>
                }
              />

              {/* Protected routes */}
              <Route
                element={
                  <AuthProvider>
                    <RequireAuth>
                      <MainLayout>
                        <Outlet />
                      </MainLayout>
                    </RequireAuth>
                  </AuthProvider>
                }
              >
                <Route path="/" element={<Home />} />
                
                {/* Core application routes - using the mobile-aware Circles component */}
                <Route path="/circles" element={<Circles />} />
                <Route path="/contact/:id" element={<RedesignedContactDetail />} />
                <Route path="/events" element={<Events />} />
                <Route path="/arlo" element={<Arlo />} />
                <Route path="/notifications" element={<Notifications />} />
                
                {/* Career Hub and tools */}
                <Route path="/career" element={<CareerHub />} />
                <Route path="/career/resume" element={<ResumeReviewer />} />
                <Route path="/career/coverLetter" element={<CoverLetterGenerator />} />
                <Route path="/career/jobAnalyzer" element={<JobAnalyzer />} />
                <Route path="/career/networkDiscovery" element={<NetworkDiscovery />} />
                <Route path="/career/interviewerResearch" element={<InterviewerResearch />} />
                <Route path="/career/companyResearch" element={<CompanyResearch />} />
                <Route path="/career/mockInterview" element={<MockInterview />} />
                <Route path="/career/followUp" element={<FollowUpGenerator />} />
                <Route path="/career/offerCompare" element={<OfferComparison />} />
                <Route path="/career/skillGap" element={<SkillGapAnalysis />} />
                
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
          </AuthErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
