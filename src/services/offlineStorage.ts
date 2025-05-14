
import { Contact } from "@/types/contact";
import { Profile } from "@/types/auth";

// Define database name and stores
const DB_NAME = "circlOfflineDB";
const DB_VERSION = 1;
const STORES = {
  PROFILE: "profile",
  CONTACTS: "contacts",
  SYNC_QUEUE: "syncQueue"
};

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Could not open IndexedDB");
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PROFILE)) {
        db.createObjectStore(STORES.PROFILE, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORES.CONTACTS)) {
        db.createObjectStore(STORES.CONTACTS, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { 
          keyPath: "id", 
          autoIncrement: true 
        });
        syncStore.createIndex("operation", "operation", { unique: false });
        syncStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
};

// Generic function to add an item to a store
const addItem = async <T>(storeName: string, item: T): Promise<T> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// Generic function to get all items from a store
const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// Generic function to get a specific item from a store
const getItem = async <T>(storeName: string, id: string): Promise<T | null> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// Generic function to delete an item from a store
const deleteItem = async (storeName: string, id: string): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// Generic function to clear a store
const clearStore = async (storeName: string): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// Queue an operation for sync when online
const queueForSync = async (operation: 'create' | 'update' | 'delete', storeName: string, data: any): Promise<void> => {
  await addItem(STORES.SYNC_QUEUE, {
    operation,
    storeName,
    data,
    timestamp: new Date().toISOString()
  });
};

// Get all pending sync operations
const getPendingSyncOps = async (): Promise<any[]> => {
  return await getAllItems(STORES.SYNC_QUEUE);
};

// Clear a sync operation after successful sync
const clearSyncOp = async (id: number): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SYNC_QUEUE, "readwrite");
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    
    transaction.oncomplete = () => db.close();
  });
};

// Profile specific functions
const saveProfile = async (profile: Profile): Promise<Profile> => {
  return await addItem(STORES.PROFILE, profile);
};

const getProfile = async (userId: string): Promise<Profile | null> => {
  return await getItem<Profile>(STORES.PROFILE, userId);
};

const clearProfile = async (): Promise<void> => {
  return await clearStore(STORES.PROFILE);
};

// Contact specific functions
const saveContacts = async (contacts: Contact[]): Promise<Contact[]> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.CONTACTS, "readwrite");
  const store = transaction.objectStore(STORES.CONTACTS);
  
  return new Promise((resolve, reject) => {
    contacts.forEach(contact => {
      store.put(contact);
    });
    
    transaction.oncomplete = () => {
      db.close();
      resolve(contacts);
    };
    
    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};

const getContact = async (id: string): Promise<Contact | null> => {
  return await getItem<Contact>(STORES.CONTACTS, id);
};

const getAllContacts = async (): Promise<Contact[]> => {
  return await getAllItems<Contact>(STORES.CONTACTS);
};

const deleteContact = async (id: string): Promise<void> => {
  return await deleteItem(STORES.CONTACTS, id);
};

const clearContacts = async (): Promise<void> => {
  return await clearStore(STORES.CONTACTS);
};

// Check if IndexedDB is available
const isIndexedDBAvailable = (): boolean => {
  return window && 'indexedDB' in window;
};

export const offlineStorage = {
  profile: {
    save: saveProfile,
    get: getProfile,
    clear: clearProfile
  },
  contacts: {
    saveAll: saveContacts,
    get: getContact,
    getAll: getAllContacts,
    delete: deleteContact,
    clear: clearContacts
  },
  sync: {
    queue: queueForSync,
    getPending: getPendingSyncOps,
    clearOp: clearSyncOp
  },
  isAvailable: isIndexedDBAvailable
};
