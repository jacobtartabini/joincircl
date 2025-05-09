
// Type definitions for PWA integration features

// Extend ServiceWorkerRegistration with periodicSync
interface PeriodicSyncManager {
  register(tag: string, options?: { minInterval: number }): Promise<void>;
  unregister(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistration {
  periodicSync?: PeriodicSyncManager;
  sync: SyncManager;
}

// Background Sync Manager
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

// Protocol Handler
interface Navigator {
  registerProtocolHandler(scheme: string, url: string, title: string): void;
}

// ShareTarget API extensions
interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: FileList;
}

interface Navigator {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
}

// Widget API (for future use)
interface WidgetUpdateEvent {
  target: string;
  data?: any;
}

interface WidgetDefinition {
  onUpdate: (event: WidgetUpdateEvent) => Promise<{ success: boolean, data?: any }>;
}

interface WidgetManager {
  register: (tag: string, definition: WidgetDefinition) => Promise<void>;
  update: (tag: string, data: any) => Promise<void>;
}

// Add Widget API to Window interface
interface Window {
  widgets?: WidgetManager;
}
