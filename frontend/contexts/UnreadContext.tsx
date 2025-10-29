import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUnreadVisitCount, getUnreadNotificationsCount } from '../utils/api';
import { onNotification, NotificationEvents } from '../utils/websocket';

type UnreadContextType = {
  unreadMessages: number;
  unreadVisits: number;
  unreadNotifications: number;
  markMessagesRead: () => void;
  markVisitsRead: () => void;
  markNotificationsRead: () => void;
  setUnreadMessages: (n: number) => void;
  setUnreadVisits: (n: number) => void;
  setUnreadNotifications: (n: number) => void;
};

const UnreadContext = createContext<UnreadContextType | undefined>(undefined);

export function UnreadProvider({ children }: { children: React.ReactNode }) {
  // mock initial counts for messages
  const [unreadMessages, setUnreadMessagesState] = useState<number>(0);
  const [unreadVisits, setUnreadVisitsState] = useState<number>(0);
  const [unreadNotifications, setUnreadNotificationsState] =
    useState<number>(0);

  // Load unread counts on mount
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const visitResult = await getUnreadVisitCount();
        setUnreadVisitsState(visitResult.unread_visits);

        const notifResult = await getUnreadNotificationsCount();
        setUnreadNotificationsState(notifResult.unread_count);
      } catch (error) {
        console.error('Error loading unread counts:', error);
      }
    };

    loadCounts();
    // Refresh counts every 30 seconds
    const interval = setInterval(loadCounts, 30000);

    // Subscribe to WebSocket notifications to update counts in real-time
    const unsubscribers: Array<() => void> = [];

    Object.values(NotificationEvents).forEach((eventType) => {
      const unsubscribe = onNotification(eventType, () => {
        setUnreadNotificationsState((prev) => prev + 1);
      });
      if (unsubscribe) {
        unsubscribers.push(unsubscribe);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  const markMessagesRead = () => setUnreadMessagesState(0);
  const markVisitsRead = () => setUnreadVisitsState(0);
  const markNotificationsRead = () => setUnreadNotificationsState(0);

  return (
    <UnreadContext.Provider
      value={{
        unreadMessages,
        unreadVisits,
        unreadNotifications,
        markMessagesRead,
        markVisitsRead,
        markNotificationsRead,
        setUnreadMessages: setUnreadMessagesState,
        setUnreadVisits: setUnreadVisitsState,
        setUnreadNotifications: setUnreadNotificationsState,
      }}
    >
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  const ctx = useContext(UnreadContext);
  if (!ctx) throw new Error('useUnread must be used within UnreadProvider');
  return ctx;
}
