"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Plus,
  Calendar,
  MessageSquare,
  Atom,
  Briefcase,
  Users,
  Settings,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Contact } from "@/types/contact";

function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  shortcut?: string;
  category?: string;
  handler: () => void;
}

// Add props for contacts
interface ActionSearchBarProps {
  actions: Action[];
  contacts?: Contact[];
  onActionSelect?: (action: Action) => void;
  placeholder?: string;
  className?: string;
}

function ActionSearchBar({ 
  actions, 
  contacts = [],
  onActionSelect,
  placeholder = "What would you like to do?",
  className = ""
}: ActionSearchBarProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ actions: Action[]; contacts: Contact[] }>({ actions: [], contacts: [] });
  const [isFocused, setIsFocused] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const debouncedQuery = useDebounce(query, 200);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isFocused) {
      setResult({ actions: [], contacts: [] });
      return;
    }

    if (!debouncedQuery) {
      setResult({ actions, contacts: [] });
      return;
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim();

    // Filter actions
    const filteredActions = actions.filter((action) => {
      const searchableText = `${action.label} ${action.description || ''} ${action.category || ''}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    // Filter contacts
    const filteredContacts = Array.isArray(contacts)
      ? contacts.filter((contact) => {
          // Search by name or company, fallback to empty string
          const name = contact.name?.toLowerCase() || "";
          const company = contact.company_name?.toLowerCase() || "";
          return (
            name.includes(normalizedQuery) ||
            company.includes(normalizedQuery)
          );
        })
      : [];

    setResult({ actions: filteredActions, contacts: filteredContacts });
  }, [debouncedQuery, isFocused, actions, contacts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleActionClick = (action: Action) => {
    setSelectedAction(action);
    setQuery("");
    setIsFocused(false);
    action.handler();
    onActionSelect?.(action);
  };

  const handleContactClick = (contactId: string) => {
    setQuery("");
    setIsFocused(false);
    navigate(`/contact/${contactId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      setQuery("");
    }
  };

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.3 },
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.15 },
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      y: -5,
      transition: { duration: 0.15 },
    },
  };

  const handleFocus = () => {
    setSelectedAction(null);
    setIsFocused(true);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex items-center">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
          <Search className="w-5 h-5 text-muted-foreground" />
        </span>
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          className={`
            pl-12 pr-4 py-3 h-12 w-full border
            border-gray-200 dark:border-white/10 
            bg-white dark:bg-background 
            rounded-full shadow-sm 
            focus-visible:ring-2 focus-visible:ring-[#0daeec]/30 
            transition-all duration-200
            text-left
            outline-none
            text-base
          `}
          style={{
            boxShadow: '0 2px 12px 0 rgba(36, 156, 255, 0.05)'
          }}
        />
        <AnimatePresence>
          {isFocused && (result.actions.length > 0 || result.contacts.length > 0) && !selectedAction && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg z-50"
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="max-h-80 overflow-y-auto">
                {result.contacts.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Contacts
                    </div>
                    <motion.ul>
                      {result.contacts.map((contact) => (
                        <motion.li
                          key={contact.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer rounded-xl transition-all duration-200"
                          variants={item}
                          onClick={() => handleContactClick(contact.id)}
                        >
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-semibold text-base">
                            {contact.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                          <div>
                            <div className="font-medium text-foreground text-sm truncate max-w-[160px]">
                              {contact.name}
                            </div>
                            {contact.company_name && (
                              <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                                {contact.company_name}
                              </div>
                            )}
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                )}

                {result.actions.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Actions
                    </div>
                    <motion.ul className="p-0">
                      {result.actions.map((action) => (
                        <motion.li
                          key={action.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer rounded-xl transition-all duration-200"
                          variants={item}
                          onClick={() => handleActionClick(action)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {action.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground text-sm">
                                {action.label}
                              </div>
                              {action.description && (
                                <div className="text-xs text-muted-foreground">
                                  {action.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {action.shortcut && (
                            <div className="text-xs text-muted-foreground bg-gray-100 dark:bg-zinc-800/40 px-2 py-1 rounded border border-gray-200 dark:border-white/10">
                              {action.shortcut}
                            </div>
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                )}
              </div>
              {result.actions.length === 0 && result.contacts.length === 0 && (
                <div className="p-8 text-center">
                  <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No matches found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                </div>
              )}
              {(result.actions.length > 0 || result.contacts.length > 0) && (
                <div className="border-t border-gray-100 dark:border-white/10 p-3 rounded-b-2xl bg-gray-50 dark:bg-zinc-900/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Press Enter to select</span>
                  <span>ESC to cancel</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export { ActionSearchBar };
