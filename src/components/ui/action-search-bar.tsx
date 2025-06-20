
"use client";

import { useState, useEffect, useMemo } from "react";
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
import type { Keystone } from "@/types/keystone";

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

interface ActionSearchBarProps {
  actions: Action[];
  contacts?: Contact[];
  keystones?: Keystone[];
  onActionSelect?: (action: Action) => void;
  onKeystoneSelect?: (keystone: Keystone) => void;
  placeholder?: string;
  className?: string;
}

function ActionSearchBar({ 
  actions, 
  contacts = [],
  keystones = [],
  onActionSelect,
  onKeystoneSelect,
  placeholder = "What would you like to do?",
  className = ""
}: ActionSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 200);
  const navigate = useNavigate();

  // Debug logging for data availability
  console.log('[ActionSearchBar] Render - contacts:', contacts?.length, 'keystones:', keystones?.length, 'query:', query);

  // Memoize the search results to prevent unnecessary recalculations
  const result = useMemo(() => {
    console.log('[ActionSearchBar] Computing search results for query:', debouncedQuery);
    console.log('[ActionSearchBar] Data available - contacts:', contacts?.length, 'keystones:', keystones?.length, 'actions:', actions?.length);

    if (!isFocused) {
      return { actions: [], contacts: [], keystones: [] };
    }

    if (!debouncedQuery) {
      return { actions, contacts: [], keystones: [] };
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    console.log('[ActionSearchBar] Normalized query:', normalizedQuery);

    // Filter actions
    const filteredActions = actions.filter((action) => {
      const searchableText = `${action.label} ${action.description || ''} ${action.category || ''}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    // Filter contacts - ensure we're searching properly
    const filteredContacts = Array.isArray(contacts)
      ? contacts.filter((contact) => {
          const name = contact.name?.toLowerCase() || "";
          const company = contact.company_name?.toLowerCase() || "";
          const email = contact.personal_email?.toLowerCase() || "";
          const jobTitle = contact.job_title?.toLowerCase() || "";
          
          const isMatch = (
            name.includes(normalizedQuery) ||
            company.includes(normalizedQuery) ||
            email.includes(normalizedQuery) ||
            jobTitle.includes(normalizedQuery)
          );
          
          if (isMatch) {
            console.log('[ActionSearchBar] Contact match found:', contact.name);
          }
          
          return isMatch;
        })
      : [];

    // Filter keystones
    const filteredKeystones = Array.isArray(keystones)
      ? keystones.filter((keystone) => {
          const title = keystone.title?.toLowerCase() || "";
          const category = keystone.category?.toLowerCase() || "";
          const notes = keystone.notes?.toLowerCase() || "";
          
          const isMatch = (
            title.includes(normalizedQuery) ||
            category.includes(normalizedQuery) ||
            notes.includes(normalizedQuery)
          );
          
          if (isMatch) {
            console.log('[ActionSearchBar] Keystone match found:', keystone.title);
          }
          
          return isMatch;
        })
      : [];

    console.log('[ActionSearchBar] Search results:', {
      actions: filteredActions.length,
      contacts: filteredContacts.length,
      keystones: filteredKeystones.length
    });

    return { actions: filteredActions, contacts: filteredContacts, keystones: filteredKeystones };
  }, [debouncedQuery, isFocused, actions, contacts, keystones]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleActionClick = (action: Action) => {
    console.log('[ActionSearchBar] Action clicked:', action.label);
    setQuery("");
    setIsFocused(false);
    action.handler();
    onActionSelect?.(action);
  };

  const handleContactClick = (contactId: string) => {
    console.log('[ActionSearchBar] Contact clicked:', contactId);
    setQuery("");
    setIsFocused(false);
    navigate(`/contact/${contactId}`);
  };

  const handleKeystoneClick = (keystone: Keystone) => {
    console.log('[ActionSearchBar] Keystone clicked:', keystone.title);
    setQuery("");
    setIsFocused(false);
    onKeystoneSelect?.(keystone);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      setQuery("");
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Add a longer delay to prevent flickering when clicking on results
    setTimeout(() => setIsFocused(false), 300);
  };

  const hasResults = result.actions.length > 0 || result.contacts.length > 0 || result.keystones.length > 0;
  const shouldShowResults = isFocused && hasResults;

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.2 },
        staggerChildren: 0.03,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.15 },
        opacity: { duration: 0.1 },
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 5 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.15 },
    },
    exit: {
      opacity: 0,
      y: -3,
      transition: { duration: 0.1 },
    },
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
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`
            pl-12 pr-4 py-3 h-12 w-full border
            border-border bg-background text-foreground
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
        <AnimatePresence mode="wait">
          {shouldShowResults && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-lg z-50 overflow-hidden"
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
              key="results"
            >
              <div className="max-h-80 overflow-y-auto">
                {result.contacts.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/50">
                      Contacts
                    </div>
                    <motion.ul>
                      {result.contacts.map((contact) => (
                        <motion.li
                          key={contact.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors duration-200"
                          variants={item}
                          onClick={() => handleContactClick(contact.id)}
                        >
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-base">
                            {contact.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm truncate">
                              {contact.name}
                            </div>
                            {contact.company_name && (
                              <div className="text-xs text-muted-foreground truncate">
                                {contact.company_name}
                              </div>
                            )}
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                )}

                {result.keystones.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/50">
                      Events
                    </div>
                    <motion.ul>
                      {result.keystones.map((keystone) => (
                        <motion.li
                          key={keystone.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors duration-200"
                          variants={item}
                          onClick={() => handleKeystoneClick(keystone)}
                        >
                          <div className="flex-shrink-0">
                            <Calendar className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm">
                              {keystone.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(keystone.date).toLocaleDateString()}
                              {keystone.category && ` • ${keystone.category}`}
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                )}

                {result.actions.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/50">
                      Actions
                    </div>
                    <motion.ul className="p-0">
                      {result.actions.map((action) => (
                        <motion.li
                          key={action.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors duration-200"
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
                            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded border">
                              {action.shortcut}
                            </div>
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                )}
              </div>
              
              {shouldShowResults && (
                <div className="border-t border-border/50 p-3 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Press Enter to select</span>
                  <span>ESC to cancel</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {isFocused && !hasResults && query && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-lg z-50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="p-8 text-center">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No matches found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export { ActionSearchBar };
