import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ProfilePanelContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const ProfilePanelContext = createContext<ProfilePanelContextType | undefined>(undefined);

export const useProfilePanel = () => {
  const context = useContext(ProfilePanelContext);
  if (!context) {
    throw new Error('useProfilePanel must be used within ProfilePanelProvider');
  }
  return context;
};

export const ProfilePanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close panel on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <ProfilePanelContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </ProfilePanelContext.Provider>
  );
};
