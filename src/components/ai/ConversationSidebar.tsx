
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, MoreHorizontal, Edit2, Trash2, Check, X, PanelLeft } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Conversation } from "@/hooks/conversationTypes";
import { motion, AnimatePresence } from "framer-motion";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onRenameConversation,
  isCollapsed = false,
  onToggleCollapse
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed ? 56 : 256
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="bg-card/95 backdrop-blur-xl border-r border-border/50 flex flex-col h-full shadow-xl flex-shrink-0"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.08)'
      }}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
          >
            {/* Collapsed Header */}
            <div className="p-2 border-b border-border/30 flex flex-col items-center gap-2"
              style={{
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <Button 
                onClick={onToggleCollapse} 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 hover:bg-muted/60 transition-all hover:scale-105"
                title="Expand sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={onCreateConversation} 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 hover:bg-primary/20 text-primary transition-all hover:scale-105"
                title="New conversation"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Collapsed Conversation Indicators */}
            <div className="flex-1 p-1 overflow-hidden">
              <div className="space-y-1">
                {conversations.slice(0, 8).map(conversation => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-8 h-8 p-0 transition-all relative",
                        activeConversationId === conversation.id 
                          ? "bg-primary/20 text-primary ring-1 ring-primary/30" 
                          : "hover:bg-muted/60"
                      )}
                      onClick={() => onSelectConversation(conversation.id)}
                      title={conversation.title}
                    >
                      <MessageSquare className="h-3 w-3" />
                      {activeConversationId === conversation.id && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute inset-0 bg-primary/10 rounded-md"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex flex-col h-full"
          >
            {/* Expanded Header */}
            <div className="p-4 border-b border-border/30 flex-shrink-0"
              style={{
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <motion.div 
                className="flex items-center gap-2 mb-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="font-semibold text-foreground text-lg">Conversations</h2>
                <Button 
                  onClick={onToggleCollapse} 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto w-8 h-8 p-0 hover:bg-muted/60 transition-all hover:scale-105"
                  title="Collapse sidebar"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Button 
                  onClick={onCreateConversation} 
                  className="w-full justify-start gap-2 rounded-xl bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  New Conversation
                </Button>
              </motion.div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <motion.div 
                  className="p-3 space-y-1"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <AnimatePresence>
                    {conversations.map((conversation, index) => (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: index * 0.05,
                          layout: { duration: 0.3 }
                        }}
                        layout
                        className={cn(
                          "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                          "hover:bg-muted/50 hover:shadow-sm active:scale-[0.98]",
                          activeConversationId === conversation.id && "bg-primary/10 shadow-sm ring-1 ring-primary/20"
                        )}
                        onClick={() => onSelectConversation(conversation.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        
                        {editingId === conversation.id ? (
                          <motion.div 
                            className="flex-1 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-6 text-sm glass-input"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-6 w-6 p-0 hover:scale-110">
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-6 w-6 p-0 hover:scale-110">
                              <X className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{conversation.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleStartEdit(conversation)}>
                                  <Edit2 className="h-3 w-3 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onDeleteConversation(conversation.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {conversations.length === 0 && (
                    <motion.div 
                      className="text-center py-8 text-muted-foreground"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs">Start a new conversation to begin</p>
                    </motion.div>
                  )}
                </motion.div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
