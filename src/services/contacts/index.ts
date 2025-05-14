
import { contactQueries } from "./contact-queries";
import { contactMutations } from "./contact-mutations";
import { offlineSync } from "./offline-sync";
import { Contact, Interaction } from "@/types/contact";

/**
 * Service for managing contacts and interactions
 */
export const contactService = {
  /**
   * Get all contacts
   */
  getContacts: contactQueries.getContacts,
  
  /**
   * Get a contact by ID
   */
  getContact: contactQueries.getContact,
  
  /**
   * Get interactions by contact ID
   */
  getInteractionsByContactId: contactQueries.getInteractionsByContactId,
  
  /**
   * Create a new contact
   */
  createContact: contactMutations.createContact,
  
  /**
   * Update an existing contact
   */
  updateContact: contactMutations.updateContact,
  
  /**
   * Delete a contact
   */
  deleteContact: contactMutations.deleteContact,
  
  /**
   * Add a new interaction
   */
  addInteraction: contactMutations.addInteraction,
  
  /**
   * Delete an interaction
   */
  deleteInteraction: contactMutations.deleteInteraction,
  
  /**
   * Sync offline changes when app comes back online
   */
  syncOfflineChanges: offlineSync.syncOfflineChanges
};
