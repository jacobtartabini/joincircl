
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/home";
import Circles from "./pages/circles";
import Keystones from "./pages/Keystones";
import Settings from "./pages/Settings";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import CallbackPage from "./pages/auth/CallbackPage";
import GoogleCallbackPage from "./pages/auth/GoogleCallbackPage";
import ContactDetail from "./pages/contact/ContactDetail";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { UserOnboarding } from "./components/UserOnboarding"; // Update to named import
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import Bugs from "./pages/Bugs";
import Legal from "./pages/Legal";
import ShareTarget from "./pages/ShareTarget";
import Notifications from "./pages/Notifications";
import Duplicates from "@/pages/Duplicates";

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
              {/* Auth routes */}
              <Route path="/auth/sign-in" element={<SignIn />} />
              <Route path="/auth/sign-up" element={<SignUp />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<CallbackPage />} />
              <Route path="/auth/callback/google" element={<GoogleCallbackPage />} />
              
              {/* Share target route */}
              <Route
                path="/share-target"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <ShareTarget />
                    </MainLayout>
                  </RequireAuth>
                }
              />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <Home />
                    </MainLayout>
                    <UserOnboarding />
                  </RequireAuth>
                }
              />
              <Route
                path="/circles"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <Circles />
                    </MainLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/contacts/:id"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <ContactDetail />
                    </MainLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/keystones"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <Keystones />
                    </MainLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/notifications"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <Notifications />
                    </MainLayout>
                  </RequireAuth>
                }
              />
              
              {/* Resource pages */}
              <Route
                path="/help"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <Help />
                    </MainLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/contact"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <Contact />
                    </MainLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/bugs"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <Bugs />
                    </MainLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/legal"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <Legal />
                    </MainLayout>
                  </RequireAuth>
                }
              />
              
              {/* Duplicates route */}
              <Route
                path="/duplicates"
                element={
                  <RequireAuth>
                    <MainLayout>
                      <Duplicates />
                    </MainLayout>
                  </RequireAuth>
                }
              />
              
              {/* Fallback routes */}
              <Route path="/index" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
