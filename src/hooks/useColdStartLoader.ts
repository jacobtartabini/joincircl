import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "./use-mobile";

export function useColdStartLoader() {
  const { loading: authLoading, user } = useAuth();
  const isMobile = useIsMobile();
  const [showLoader, setShowLoader] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasShownLoaderRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Detect if this is a cold start (fresh page load, not back navigation)
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const isColdStart = navigationEntry?.type === 'navigate' ||
                       !sessionStorage.getItem('app_initialized') ||
                       !document.referrer;

    // Only show loader on mobile cold starts
    if (isMobile && isColdStart && isInitialLoad && !hasShownLoaderRef.current) {
      console.log('Cold start detected, showing loader');
      setShowLoader(true);
      hasShownLoaderRef.current = true;
    }

    // Mark app as initialized
    sessionStorage.setItem('app_initialized', 'true');
  }, [isMobile, isInitialLoad]);

  useEffect(() => {
    // Hide loader when auth is complete and minimum time has passed
    if (!authLoading && user !== undefined) {
      const elapsedTime = Date.now() - startTimeRef.current;
      const minLoadTime = 1000; // Minimum 1 second to prevent flash

      if (elapsedTime >= minLoadTime) {
        setShowLoader(false);
        setIsInitialLoad(false);
      } else {
        const remainingTime = minLoadTime - elapsedTime;
        setTimeout(() => {
          setShowLoader(false);
          setIsInitialLoad(false);
        }, remainingTime);
      }
    }
  }, [authLoading, user]);

  const onLoadingComplete = () => {
    setShowLoader(false);
    setIsInitialLoad(false);
  };

  return {
    showLoader,
    onLoadingComplete
  };
}