
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '../types';
import { login as apiLogin, signup as apiSignup, getMockUserById, updateUser as apiUpdateUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (id: string, pass: string) => Promise<void>;
  signup: (email: string, username: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: { username: string; bio: string; profileImageFile: File | null }) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      setIsLoading(true);
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        try {
          // In a real app, you'd verify the token with the backend
          const loggedInUser = await getMockUserById(storedUserId);
          setUser(loggedInUser);
        } catch (error) {
          console.error('Failed to restore session', error);
          localStorage.removeItem('userId');
        }
      }
      setIsLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (id: string, pass: string) => {
    const loggedInUser = await apiLogin(id, pass);
    setUser(loggedInUser);
    localStorage.setItem('userId', loggedInUser.id);
  };

  const signup = async (email: string, username: string, pass: string) => {
    const newUser = await apiSignup(email, username, pass);
    setUser(newUser);
    localStorage.setItem('userId', newUser.id);
  };
  
  const updateUser = async (data: { username: string; bio: string; profileImageFile: File | null }) => {
    if (!user) throw new Error("No user logged in");
    
    let imageUrl = user.profileImageUrl;
    if (data.profileImageFile) {
      // In a real app, upload the file and get a URL.
      // For mock, we'll create a local blob URL.
      imageUrl = URL.createObjectURL(data.profileImageFile);
    }
    
    const updatedUser = await apiUpdateUser(user.id, {
      username: data.username,
      bio: data.bio,
      profileImageUrl: imageUrl,
    });

    setUser(updatedUser);
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
