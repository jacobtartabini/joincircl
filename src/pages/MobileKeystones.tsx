import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keystoneService } from "@/services/keystoneService";
import { contactService } from "@/services/contactService";
import { Keystone } from "@/types/keystone";
import { Contact } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MoreVertical, Edit, Trash } from "lucide-react";
import { format, isAfter, startOfToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { MobileCard, MobileCardContent } from "@/components/ui/mobile-card";
import { MobileModal } from "@/components/ui/mobile-modal";
import { MobileForm } from "@/components/ui/mobile-form";
import { MobileInput } from "@/components/ui/mobile-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export default function MobileKeystones() {
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKeystone, setEditingKeystone] = useState<Keystone | null>(null);
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const today = startOfToday();
  const {
    data: keystones = [],
    isLoading
  } = useQuery({
    queryKey: ['keystones'],
    queryFn: keystoneService.getKeystones
  });
  const {
    data: contacts = []
  } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactService.getContacts
  });
  const contactMap = useMemo(() => {
    const map = new Map<string, Contact>();
    contacts.forEach(contact => map.set(contact.id, contact));
    return map;
  }, [contacts]);
  const categorizedKeystones = useMemo(() => {
    const upcoming: Keystone[] = [];
    const past: Keystone[] = [];
    keystones.forEach(keystone => {
      const keystoneDate = new Date(keystone.date);
      if (isAfter(keystoneDate, today) || format(keystoneDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        upcoming.push(keystone);
      } else {
        past.push(keystone);
      }
    });
    return {
      upcoming: upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      past: past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  }, [keystones, today]);
  const KeystoneCard = ({
    keystone,
    isPast = false
  }: {
    keystone: Keystone;
    isPast?: boolean;
  }) => {
    const contact = keystone.contact_id ? contactMap.get(keystone.contact_id) : null;
    const daysUntil = Math.ceil((new Date(keystone.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return <motion.div layout initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} exit={{
      opacity: 0,
      y: -20
    }} className="group">
        <MobileCard isPressable onClick={() => {
        setSelectedKeystone(keystone);
        setIsDetailOpen(true);
      }} className={cn("mb-3 relative", isPast && "opacity-75")}>
          <MobileCardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{keystone.title}</h3>
                  {keystone.category && <Badge variant="secondary" className="text-xs">
                      {keystone.category}
                    </Badge>}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(keystone.date), 'MMM d, yyyy')}</span>
                  {!isPast && daysUntil >= 0 && <Badge variant={daysUntil <= 7 ? "destructive" : "outline"} className="text-xs">
                      {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                    </Badge>}
                </div>
                
                {contact && <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      {contact.avatar_url ? <AvatarImage src={contact.avatar_url} alt={contact.name} /> : <AvatarFallback className="text-xs bg-gray-100">
                          {contact.name.charAt(0)}
                        </AvatarFallback>}
                    </Avatar>
                    <span className="text-sm text-gray-600">{contact.name}</span>
                  </div>}
                
                {keystone.notes && <p className="text-sm text-gray-500 line-clamp-2">{keystone.notes}</p>}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={e => {
                  e.stopPropagation();
                  setEditingKeystone(keystone);
                  setIsFormOpen(true);
                }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={e => {
                  e.stopPropagation();
                  // Handle delete
                }} className="text-red-600">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </MobileCardContent>
        </MobileCard>
      </motion.div>;
  };
  if (isLoading) {
    return <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading keystones...</p>
        </div>
      </div>;
  }
  return <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">Keystones</h1>
          <Button onClick={() => {
          setEditingKeystone(null);
          setIsFormOpen(true);
        }} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        <p className="text-sm text-gray-600">Important dates and milestones</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Upcoming Keystones */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">
            Upcoming ({categorizedKeystones.upcoming.length})
          </h2>
          {categorizedKeystones.upcoming.length > 0 ? <AnimatePresence mode="popLayout">
              {categorizedKeystones.upcoming.map(keystone => <KeystoneCard key={keystone.id} keystone={keystone} />)}
            </AnimatePresence> : <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No upcoming keystones</h3>
              <p className="text-sm text-gray-600 mb-4">Add your first keystone to get started</p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Keystone
              </Button>
            </div>}
        </section>

        {/* Past Keystones */}
        {categorizedKeystones.past.length > 0 && <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-900">
              Past ({categorizedKeystones.past.length})
            </h2>
            <AnimatePresence mode="popLayout">
              {categorizedKeystones.past.map(keystone => <KeystoneCard key={keystone.id} keystone={keystone} isPast />)}
            </AnimatePresence>
          </section>}
      </div>

      {/* Form Modal */}
      <MobileModal isOpen={isFormOpen} onClose={() => {
      setIsFormOpen(false);
      setEditingKeystone(null);
    }} title={editingKeystone ? "Edit Keystone" : "Add Keystone"}>
        <KeystoneFormContent keystone={editingKeystone} contacts={contacts} onSuccess={() => {
        queryClient.invalidateQueries({
          queryKey: ['keystones']
        });
        setIsFormOpen(false);
        setEditingKeystone(null);
        toast({
          title: editingKeystone ? "Keystone updated" : "Keystone created",
          description: "Your keystone has been saved successfully."
        });
      }} onCancel={() => {
        setIsFormOpen(false);
        setEditingKeystone(null);
      }} />
      </MobileModal>

      {/* Detail Modal */}
      <MobileModal isOpen={isDetailOpen} onClose={() => {
      setIsDetailOpen(false);
      setSelectedKeystone(null);
    }} title="Keystone Details">
        {selectedKeystone && <div className="space-y-4">
            <h3 className="text-lg font-semibold">{selectedKeystone.title}</h3>
            <p className="text-gray-600">{format(new Date(selectedKeystone.date), 'MMMM d, yyyy')}</p>
            {selectedKeystone.notes && <p className="text-sm text-gray-600">{selectedKeystone.notes}</p>}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => {
            setIsDetailOpen(false);
            setEditingKeystone(selectedKeystone);
            setIsFormOpen(true);
          }}>
                Edit
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => {
            // Handle delete
          }}>
                Delete
              </Button>
            </div>
          </div>}
      </MobileModal>
    </div>;
}

// Simplified form component for mobile
function KeystoneFormContent({
  keystone,
  contacts,
  onSuccess,
  onCancel
}: {
  keystone?: Keystone | null;
  contacts: Contact[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: keystone?.title || "",
    date: keystone?.date ? format(new Date(keystone.date), 'yyyy-MM-dd') : "",
    category: keystone?.category || "",
    contact_id: keystone?.contact_id || "",
    notes: keystone?.notes || ""
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onSuccess();
  };
  return <MobileForm onSubmit={handleSubmit} onCancel={onCancel} submitLabel={keystone ? "Update" : "Create"}>
      <MobileInput label="Title *" value={formData.title} onChange={e => setFormData(prev => ({
      ...prev,
      title: e.target.value
    }))} placeholder="Enter keystone title" required />

      <MobileInput label="Date *" type="date" value={formData.date} onChange={e => setFormData(prev => ({
      ...prev,
      date: e.target.value
    }))} required />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Category</label>
        <Select value={formData.category} onValueChange={value => setFormData(prev => ({
        ...prev,
        category: value
      }))}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Birthday">Birthday</SelectItem>
            <SelectItem value="Anniversary">Anniversary</SelectItem>
            <SelectItem value="Meeting">Meeting</SelectItem>
            <SelectItem value="Deadline">Deadline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <Textarea value={formData.notes} onChange={e => setFormData(prev => ({
        ...prev,
        notes: e.target.value
      }))} placeholder="Add notes..." className="min-h-24 resize-none" />
      </div>
    </MobileForm>;
}