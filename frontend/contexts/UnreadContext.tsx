import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUnreadVisitCount } from '../utils/api';

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
  // mock initial counts for messages and notifications
  const [unreadMessages, setUnreadMessagesState] = useState<number>(0);
  const [unreadVisits, setUnreadVisitsState] = useState<number>(0);
  const [unreadNotifications, setUnreadNotificationsState] = useState<number>(0);

  // Load unread visits count on mount
  useEffect(() => {
    const loadVisitCount = async () => {
      try {
        const result = await getUnreadVisitCount();
        setUnreadVisitsState(result.unread_visits);
      } catch (error) {
        console.error('Error loading unread visits count:', error);
      }
    };

    loadVisitCount();
    // Refresh visit count every 30 seconds
    const interval = setInterval(loadVisitCount, 30000);
    return () => clearInterval(interval);
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
