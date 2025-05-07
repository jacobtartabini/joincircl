
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Circles from "./pages/Circles";
import Keystones from "./pages/Keystones";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CallbackPage from "./pages/auth/CallbackPage";
import ContactDetail from "./pages/contact/ContactDetail";
import { Toaster } from "./components/ui/toaster";
import RequireAuth from "./components/guards/RequireAuth";
import Index from "./pages/Index";
import { AuthProvider } from "./contexts/AuthContext";
import Help from "./pages/resources/Help";
import Contact from "./pages/resources/Contact";
import Bugs from "./pages/resources/Bugs";
import Legal from "./pages/resources/Legal";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth/sign-in" element={<SignIn />} />
          <Route path="/auth/sign-up" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/callback" element={<CallbackPage />} />

          {/* Protected Routes */}
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/circles" element={<Circles />} />
              <Route path="/keystones" element={<Keystones />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/contacts/:id" element={<ContactDetail />} />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/bugs" element={<Bugs />} />
              <Route path="/legal" element={<Legal />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
