import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../types/mahwous_pro';

interface UserContextType {
  user: UserRole | null;
  setUser: (user: UserRole | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserRole | null>(() => {
    // استرجاع بيانات المستخدم من localStorage
    const savedUser = localStorage.getItem('mahwous_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const setUser = (newUser: UserRole | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('mahwous_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('mahwous_user');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
