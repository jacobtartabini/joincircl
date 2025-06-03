
import { useState, useCallback } from "react";

export function useGlobalAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  const minimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  return {
    isOpen,
    isMinimized,
    toggleOpen,
    minimize,
    close
  };
}
