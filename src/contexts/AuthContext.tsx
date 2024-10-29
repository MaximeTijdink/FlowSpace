import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { validateEmail, validatePassword } from '../utils/validation';

const AuthContext = createContext<AuthContextType | null>(null);

const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.85 2.83 0 0 1 0 4l-1.5 1.5'/%3E%3Cpath d='M17 3a2.85 2.83 0 0 1 4 4L7 21l-4 1 1-4Z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/svg%3E";

const initializeTestAccounts = () => {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    // Remove existing test accounts
    const filteredUsers = users.filter((u: any) => 
      u.email !== 'maxime.tijdink@gmail.com' && 
      u.email !== 'test@example.com'
    );
    
    // Add the admin account
    filteredUsers.push({
      id: '1',
      name: 'Maxime Tijdink',
      email: 'maxime.tijdink@gmail.com',
      password: '12345678',
      avatar: defaultAvatar,
      createdAt: new Date().toISOString(),
      role: 'admin',
      status: 'active',
      lastLogin: null
    });

    // Add a test account
    filteredUsers.push({
      id: '2',
      name: 'Test User',
      email: 'test@example.com',
      password: 'test1234',
      avatar: defaultAvatar,
      createdAt: new Date().toISOString(),
      role: 'user',
      status: 'active',
      lastLogin: null
    });
    
    localStorage.setItem('users', JSON.stringify(filteredUsers));
  } catch (error) {
    console.error('Error initializing test accounts:', error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeTestAccounts();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing saved user:', err);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email);
      
      if (!user) {
        throw new Error('No account found with this email');
      }

      if (user.password !== password) {
        throw new Error('Incorrect password');
      }

      if (user.status === 'suspended') {
        throw new Error('This account has been suspended');
      }

      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      };

      // Update the user's last login in storage
      localStorage.setItem('users', JSON.stringify(
        users.map((u: any) => u.id === user.id ? updatedUser : u)
      ));

      const { password: _, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!name.trim()) {
        throw new Error('Name is required');
      }

      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      if (!validatePassword(password)) {
        throw new Error('Password must be at least 8 characters long');
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (users.some((u: any) => u.email === email)) {
        throw new Error('An account with this email already exists');
      }

      const newUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.toLowerCase(),
        password,
        avatar: defaultAvatar,
        createdAt: new Date().toISOString(),
        role: 'user',
        status: 'active',
        lastLogin: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);

    if (userIndex === -1) throw new Error('User not found');

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    
    localStorage.setItem('users', JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}