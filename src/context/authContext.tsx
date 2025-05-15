import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: number;
  token: string;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<number>>;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  logOut: () => void;
}

const DEFAULT_VALUES = {
  user: -1,
  token: '',
  isAuthenticated: false,
  setUser: () => {},
  setToken: () => {},
  setIsAuthenticated: () => {},
  logOut: () => {},
};

const AuthContext = React.createContext<AuthContextType>(DEFAULT_VALUES);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<number>(DEFAULT_VALUES.user);
  const [token, setToken] = useState<string>(DEFAULT_VALUES.token);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const navigate = useNavigate();
  const logOut = () => {
    setToken('');
    setUser(-1);
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('login');
  };
  return <AuthContext.Provider value={{ user, token, isAuthenticated, setUser, setToken, setIsAuthenticated, logOut }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};
