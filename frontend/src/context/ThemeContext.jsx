import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('crm-theme');
    return saved ? saved === 'dark' : true;
  });

  const toggle = () => {
    setDark(prev => {
      localStorage.setItem('crm-theme', !prev ? 'dark' : 'light');
      return !prev;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
