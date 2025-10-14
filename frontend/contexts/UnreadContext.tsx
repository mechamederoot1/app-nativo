import React, { createContext, useContext, useState } from 'react';

type UnreadContextType = {
  unreadMessages: number;
  unreadVisits: number;
  unreadNotifications: number;
  markMessagesRead: () => void;
  markVisitsRead: () => void;
  setUnreadMessages: (n: number) => void;
  setUnreadVisits: (n: number) => void;
};

const UnreadContext = createContext<UnreadContextType | undefined>(undefined);

export function UnreadProvider({ children }: { children: React.ReactNode }) {
  // mock initial counts
  const [unreadMessages, setUnreadMessagesState] = useState<number>(2);
  const [unreadVisits, setUnreadVisitsState] = useState<number>(1);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  const markMessagesRead = () => setUnreadMessagesState(0);
  const markVisitsRead = () => setUnreadVisitsState(0);

  return (
    <UnreadContext.Provider
      value={{
        unreadMessages,
        unreadVisits,
        unreadNotifications,
        markMessagesRead,
        markVisitsRead,
        setUnreadMessages: setUnreadMessagesState,
        setUnreadVisits: setUnreadVisitsState,
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
