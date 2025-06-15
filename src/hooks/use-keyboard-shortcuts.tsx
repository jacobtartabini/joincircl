
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseKeyboardShortcutsProps {
  onAddContact?: () => void;
  onAddKeystone?: () => void;
  onAddInteraction?: () => void;
}

export function useKeyboardShortcuts({ 
  onAddContact, 
  onAddKeystone, 
  onAddInteraction 
}: UseKeyboardShortcutsProps = {}) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd/Ctrl key combinations
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            onAddContact?.();
            break;
          case 'e':
            event.preventDefault();
            onAddKeystone?.();
            break;
          case 'i':
            event.preventDefault();
            onAddInteraction?.();
            break;
          case 'a':
            event.preventDefault();
            navigate('/ai-assistant');
            break;
          case 'c':
            event.preventDefault();
            navigate('/circles');
            break;
          case ',':
            event.preventDefault();
            navigate('/settings');
            break;
          default:
            break;
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, onAddContact, onAddKeystone, onAddInteraction]);
}
