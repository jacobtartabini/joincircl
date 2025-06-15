
import { useState, useEffect } from 'react';

export function useSidebarState(defaultState: boolean = true) {
  const [isOpen, setIsOpen] = useState(defaultState);

  useEffect(() => {
    const saved = localStorage.getItem('arlo-sidebar-open');
    if (saved !== null) {
      setIsOpen(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('arlo-sidebar-open', JSON.stringify(newState));
  };

  const setSidebarOpen = (open: boolean) => {
    setIsOpen(open);
    localStorage.setItem('arlo-sidebar-open', JSON.stringify(open));
  };

  return {
    isOpen,
    toggleSidebar,
    setSidebarOpen
  };
}
