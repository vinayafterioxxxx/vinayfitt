import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'client' | 'trainer' | 'nutritionist' | 'admin' | 'hr';

interface UserContextType {
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  userName: string;
  setUserName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('User');

  return (
    <UserContext.Provider value={{ userRole, setUserRole, userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserProvider');
  }
  return context;
}