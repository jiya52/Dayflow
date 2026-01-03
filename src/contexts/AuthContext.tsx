import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  position: string;
  avatar?: string;
  phone?: string;
  address?: string;
  joinDate: string;
  salary: {
    basic: number;
    allowances: number;
    deductions: number;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface SignupData {
  employeeId: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    email: 'john.doe@dayflow.com',
    password: 'password123',
    name: 'John Doe',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Developer',
    phone: '+1 234 567 8900',
    address: '123 Tech Street, San Francisco, CA',
    joinDate: '2023-03-15',
    salary: {
      basic: 75000,
      allowances: 12000,
      deductions: 8500,
    },
  },
  {
    id: '2',
    employeeId: 'ADM001',
    email: 'sarah.admin@dayflow.com',
    password: 'admin123',
    name: 'Sarah Johnson',
    role: 'admin',
    department: 'Human Resources',
    position: 'HR Manager',
    phone: '+1 234 567 8901',
    address: '456 HR Avenue, San Francisco, CA',
    joinDate: '2022-01-10',
    salary: {
      basic: 85000,
      allowances: 15000,
      deductions: 10000,
    },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('dayflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('dayflow_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return { success: true };
    }
    
    setIsLoading(false);
    return { success: false, error: 'Invalid email or password' };
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if user already exists
    if (mockUsers.some(u => u.email === data.email)) {
      setIsLoading(false);
      return { success: false, error: 'Email already registered' };
    }
    
    if (mockUsers.some(u => u.employeeId === data.employeeId)) {
      setIsLoading(false);
      return { success: false, error: 'Employee ID already exists' };
    }
    
    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      employeeId: data.employeeId,
      email: data.email,
      name: data.name,
      role: data.role,
      department: data.role === 'admin' ? 'Human Resources' : 'General',
      position: data.role === 'admin' ? 'HR Officer' : 'Employee',
      joinDate: new Date().toISOString().split('T')[0],
      salary: {
        basic: data.role === 'admin' ? 70000 : 55000,
        allowances: 8000,
        deductions: 5000,
      },
    };
    
    setUser(newUser);
    localStorage.setItem('dayflow_user', JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dayflow_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
