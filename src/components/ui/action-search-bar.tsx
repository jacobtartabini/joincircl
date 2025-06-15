
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

interface SearchResult {
    actions: Action[];
}

interface ActionSearchBarProps {
    actions: Action[];
    onActionSelect?: (action: Action) => void;
    placeholder?: string;
    className?: string;
}

function ActionSearchBar({ 
    actions, 
    onActionSelect,
    placeholder = "What would you like to do?",
    className = ""
}: ActionSearchBarProps) {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<SearchResult | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const debouncedQuery = useDebounce(query, 200);

    useEffect(() => {
        if (!isFocused) {
            setResult(null);
            return;
        }

        if (!debouncedQuery) {
            setResult({ actions });
            return;
        }

        const normalizedQuery = debouncedQuery.toLowerCase().trim();
        const filteredActions = actions.filter((action) => {
            const searchableText = `${action.label} ${action.description || ''} ${action.category || ''}`.toLowerCase();
            return searchableText.includes(normalizedQuery);
        });

        setResult({ actions: filteredActions });
    }, [debouncedQuery, isFocused, actions]);

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
        <div className={`w-full max-w-2xl mx-auto ${className}`}>
            <div className="relative">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        onKeyDown={handleKeyDown}
                        className="pl-4 pr-12 py-3 h-12 text-base rounded-xl glass-input border-white/20 dark:border-white/15 focus-visible:ring-2 focus-visible:ring-[#0daeec]/30 focus-visible:ring-offset-0 transition-all duration-200"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5">
                        <AnimatePresence mode="popLayout">
                            {query.length > 0 ? (
                                <motion.div
                                    key="send"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Send className="w-5 h-5 text-muted-foreground" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="search"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Search className="w-5 h-5 text-muted-foreground" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence>
                    {isFocused && result && !selectedAction && (
                        <motion.div
                            className="absolute top-full left-0 right-0 mt-2 glass-card-enhanced border-white/20 dark:border-white/15 rounded-xl overflow-hidden z-50"
                            variants={container}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                        >
                            <div className="max-h-80 overflow-y-auto">
                                {result.actions.length > 0 ? (
                                    <motion.ul className="p-2">
                                        {result.actions.map((action) => (
                                            <motion.li
                                                key={action.id}
                                                className="unified-button flex items-center justify-between p-3 hover:bg-white/30 dark:hover:bg-white/5 cursor-pointer rounded-lg transition-all duration-200"
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
                                                    <div className="text-xs text-muted-foreground bg-white/10 dark:bg-white/5 px-2 py-1 rounded border border-white/20 dark:border-white/10">
                                                        {action.shortcut}
                                                    </div>
                                                )}
                                            </motion.li>
                                        ))}
                                    </motion.ul>
                                ) : (
                                    <div className="p-8 text-center">
                                        <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                        <p className="text-sm text-muted-foreground">No actions found</p>
                                        <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                                    </div>
                                )}
                            </div>
                            
                            {result.actions.length > 0 && (
                                <div className="border-t border-white/20 dark:border-white/10 p-3 bg-white/5 dark:bg-white/2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Press Enter to select</span>
                                        <span>ESC to cancel</span>
                                    </div>
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
