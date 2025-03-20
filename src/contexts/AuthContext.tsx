
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/utils/types';
import { USERS } from '@/utils/constants';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if the user is already logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find the user by username and password
    const foundUser = USERS.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (foundUser) {
      setUser(foundUser as User);
      setIsAuthenticated(true);
      // Save the user to localStorage
      localStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Remove the user from localStorage
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protected routes
export const withAuth = (Component: React.ComponentType, allowedRoles?: string[]) => {
  return function ProtectedRoute(props: any) {
    const { isAuthenticated, user } = useAuth();
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      // We'll handle this in the App component
      return null;
    }
    
    // Check if the user has the required role
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Unauthorized - redirect to dashboard or show unauthorized message
      return <div>Tidak Memiliki Akses</div>;
    }
    
    // If authenticated and authorized, render the component
    return <Component {...props} />;
  };
};
