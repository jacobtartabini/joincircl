
import { useState, useEffect } from "react";
import { Contact } from "@/types/contact";

interface SmartSuggestion {
  text: string;
  category: 'network' | 'activity' | 'insights' | 'actions';
}

export function useSmartSuggestions(contacts: Contact[]) {
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  const baseSuggestions: SmartSuggestion[] = [
    { text: "Who should I reach out to this week?", category: 'network' },
    { text: "Summarize my recent keystone activity", category: 'activity' },
    { text: "What changed since I last logged in?", category: 'insights' },
    { text: "How can I strengthen my inner circle?", category: 'network' },
    { text: "Show me contacts I haven't spoken to recently", category: 'insights' },
    { text: "Help me plan my networking for this month", category: 'actions' },
    { text: "Who are my most important connections?", category: 'network' },
    { text: "What follow-ups do I need to make?", category: 'actions' }
  ];

  // Add dynamic suggestions based on contact data
  const getDynamicSuggestions = (): SmartSuggestion[] => {
    const suggestions = [...baseSuggestions];
    
    if (contacts.length > 0) {
      suggestions.push(
        { text: `Tell me about my ${contacts.length} contacts`, category: 'insights' }
      );
    }

    const innerCircleCount = contacts.filter(c => c.circle === 'inner').length;
    if (innerCircleCount > 0) {
      suggestions.push(
        { text: `How to maintain my ${innerCircleCount} inner circle contacts?`, category: 'network' }
      );
    }

    return suggestions;
  };

  const [suggestions] = useState(() => getDynamicSuggestions());

  // Rotate suggestions every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [suggestions.length]);

  const getCurrentSuggestions = () => {
    const current = suggestions[currentSuggestionIndex];
    const next = suggestions[(currentSuggestionIndex + 1) % suggestions.length];
    const nextNext = suggestions[(currentSuggestionIndex + 2) % suggestions.length];
    
    return [current, next, nextNext];
  };

  return {
    currentSuggestions: getCurrentSuggestions(),
    allSuggestions: suggestions,
    rotateTo: (index: number) => setCurrentSuggestionIndex(index % suggestions.length)
  };
}
