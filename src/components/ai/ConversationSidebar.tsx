

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, MoreHorizontal, Edit2, Trash2, Check, X, PanelLeft } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Conversation } from "@/hooks/conversationTypes";

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

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white/80 dark:bg-black/20 border-r border-white/20 dark:border-white/10 backdrop-blur-lg flex flex-col h-full">
        <div className="p-4 border-b border-white/20 dark:border-white/10 flex justify-center">
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 glass-button"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {/* No content when collapsed - just the toggle button */}
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/80 dark:bg-black/20 border-r border-white/20 dark:border-white/10 backdrop-blur-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/20 dark:border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="sm"
            className="ml-auto w-8 h-8 p-0 glass-button"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          onClick={onCreateConversation} 
          className="w-full justify-start gap-2 glass-button rounded-full bg-[#0daeec]"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group relative flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all",
                "hover:bg-white/20 dark:hover:bg-white/10",
                activeConversationId === conversation.id && "bg-white/30 dark:bg-white/15 shadow-sm"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              
              {editingId === conversation.id ? (
                <div className="flex-1 flex items-center gap-1">
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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveEdit}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
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
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new conversation to begin</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

