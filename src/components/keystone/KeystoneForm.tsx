import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Loader2, Trash } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Contact } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { keystoneService } from "@/services/keystoneService";
import { contactService } from "@/services/contactService";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.date(),
  notes: z.string().optional(),
  contact_id: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  is_recurring: z.boolean().default(false),
  recurrence_frequency: z.string().optional(),
});

const categories = [
  "Birthday",
  "Anniversary",
  "Follow-up",
  "Meeting",
  "Event",
  "Reminder",
  "Other",
];

interface KeystoneFormProps {
  keystone?: Keystone;
  contact?: Contact;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  isOpen: boolean;
}

export default function KeystoneForm({
  keystone,
  contact,
  onSuccess,
  onCancel,
  onDelete,
  isOpen,
}: KeystoneFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const backdropRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: keystone?.title || "",
      date: keystone?.date ? new Date(keystone.date) : new Date(),
      notes: keystone?.notes || "",
      contact_id: keystone?.contact_id || contact?.id || "",
      category: keystone?.category || "Reminder",
      is_recurring: keystone?.is_recurring || false,
      recurrence_frequency: keystone?.recurrence_frequency || "Monthly",
    },
  });

  const isRecurring = form.watch("is_recurring");

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await contactService.getContacts();
        setContacts(data);
      } catch (error) {
        console.error("Error loading contacts:", error);
      }
    };

    loadContacts();
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onCancel();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const endY = e.touches[0].clientY;
    if (startY.current !== null && endY - startY.current > 100) {
      onCancel();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (keystone?.id) {
        await keystoneService.updateKeystone(keystone.id, {
          title: values.title,
          date: values.date.toISOString(),
          notes: values.notes,
          contact_id: values.contact_id,
          category: values.category,
          is_recurring: values.is_recurring,
          recurrence_frequency: values.is_recurring
            ? values.recurrence_frequency
            : undefined,
        });

        toast({
          title: "Keystone updated",
          description: "Your keystone has been updated successfully.",
        });
      } else {
        await keystoneService.createKeystone({
          title: values.title,
          date: values.date.toISOString(),
          notes: values.notes,
          contact_id: values.contact_id,
          category: values.category,
          is_recurring: values.is_recurring,
          recurrence_frequency: values.is_recurring
            ? values.recurrence_frequency
            : undefined,
        });

        toast({
          title: "Keystone created",
          description: "Your new keystone has been created successfully.",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving keystone:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save keystone. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center"
    >
      <div
        className="bg-white w-full max-w-md rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto shadow-lg animate-slide-in-up"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter keystone title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contact_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contact" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Recurring Event</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isRecurring && (
              <FormField
                control={form.control}
                name="recurrence_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4">
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {keystone?.id ? "Update" : "Create"} Keystone
                </Button>
              </div>

              {keystone?.id && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  className="mt-2 flex items-center gap-1 w-full sm:w-auto sm:self-end"
                >
                  <Trash size={16} />
                  Delete Keystone
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
