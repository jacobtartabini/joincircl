
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: string;
  read: boolean;
}

export interface NotificationPreferences {
  push: {
    newContacts: boolean;
    keystoneReminders: boolean;
    systemUpdates: boolean;
  };
  email: {
    weeklySummary: boolean;
    importantKeystones: boolean;
    productUpdates: boolean;
  };
}
