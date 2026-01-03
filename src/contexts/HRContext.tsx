import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from './AuthContext';

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'paid' | 'sick' | 'unpaid';

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breaks: { start: string; end: string }[];
  status: AttendanceStatus;
  totalHours: number;
  employeeId: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  adminComment?: string;
  appliedOn: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
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

interface HRContextType {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  todayAttendance: AttendanceRecord | null;
  checkIn: (employeeId: string) => void;
  checkOut: (employeeId: string) => void;
  startBreak: (employeeId: string) => void;
  endBreak: (employeeId: string) => void;
  applyLeave: (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus, comment?: string) => void;
  updateEmployeeProfile: (id: string, updates: Partial<Employee>) => void;
  getEmployeeAttendance: (employeeId: string) => AttendanceRecord[];
  getEmployeeLeaves: (employeeId: string) => LeaveRequest[];
}

const HRContext = createContext<HRContextType | undefined>(undefined);

// Mock data
const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    email: 'john.doe@dayflow.com',
    name: 'John Doe',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Developer',
    phone: '+1 234 567 8900',
    address: '123 Tech Street, San Francisco, CA',
    joinDate: '2023-03-15',
    salary: { basic: 75000, allowances: 12000, deductions: 8500 },
  },
  {
    id: '2',
    employeeId: 'ADM001',
    email: 'sarah.admin@dayflow.com',
    name: 'Sarah Johnson',
    role: 'admin',
    department: 'Human Resources',
    position: 'HR Manager',
    phone: '+1 234 567 8901',
    address: '456 HR Avenue, San Francisco, CA',
    joinDate: '2022-01-10',
    salary: { basic: 85000, allowances: 15000, deductions: 10000 },
  },
  {
    id: '3',
    employeeId: 'EMP002',
    email: 'mike.chen@dayflow.com',
    name: 'Mike Chen',
    role: 'employee',
    department: 'Design',
    position: 'UI/UX Designer',
    phone: '+1 234 567 8902',
    address: '789 Design Blvd, San Francisco, CA',
    joinDate: '2023-06-20',
    salary: { basic: 70000, allowances: 10000, deductions: 7500 },
  },
  {
    id: '4',
    employeeId: 'EMP003',
    email: 'emma.wilson@dayflow.com',
    name: 'Emma Wilson',
    role: 'employee',
    department: 'Marketing',
    position: 'Marketing Specialist',
    phone: '+1 234 567 8903',
    address: '321 Market St, San Francisco, CA',
    joinDate: '2023-09-01',
    salary: { basic: 65000, allowances: 9000, deductions: 7000 },
  },
];

const today = new Date().toISOString().split('T')[0];

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    date: today,
    checkIn: '09:05',
    checkOut: '18:15',
    breaks: [{ start: '12:30', end: '13:15' }],
    status: 'present',
    totalHours: 8.5,
    employeeId: 'EMP001',
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '18:00',
    breaks: [{ start: '12:00', end: '13:00' }],
    status: 'present',
    totalHours: 8,
    employeeId: 'EMP001',
  },
  {
    id: '3',
    date: today,
    checkIn: '08:55',
    checkOut: '17:30',
    breaks: [{ start: '12:15', end: '13:00' }],
    status: 'present',
    totalHours: 7.8,
    employeeId: 'EMP002',
  },
];

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    type: 'paid',
    startDate: '2024-02-15',
    endDate: '2024-02-17',
    reason: 'Family vacation',
    status: 'approved',
    adminComment: 'Approved. Enjoy your vacation!',
    appliedOn: '2024-02-01',
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'Mike Chen',
    type: 'sick',
    startDate: '2024-02-20',
    endDate: '2024-02-21',
    reason: 'Not feeling well',
    status: 'pending',
    appliedOn: '2024-02-18',
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: 'Emma Wilson',
    type: 'unpaid',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    reason: 'Personal matters',
    status: 'pending',
    appliedOn: '2024-02-25',
  },
];

export function HRProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);

  const getTodayAttendance = (employeeId: string): AttendanceRecord | null => {
    return attendanceRecords.find(r => r.employeeId === employeeId && r.date === today) || null;
  };

  const checkIn = (employeeId: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const existingRecord = getTodayAttendance(employeeId);
    
    if (!existingRecord) {
      const newRecord: AttendanceRecord = {
        id: String(attendanceRecords.length + 1),
        date: today,
        checkIn: time,
        breaks: [],
        status: 'present',
        totalHours: 0,
        employeeId,
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
    }
  };

  const checkOut = (employeeId: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setAttendanceRecords(records =>
      records.map(r => {
        if (r.employeeId === employeeId && r.date === today) {
          const checkInTime = r.checkIn ? parseTime(r.checkIn) : 0;
          const checkOutTime = parseTime(time);
          const breakTime = r.breaks.reduce((acc, b) => {
            return acc + (parseTime(b.end) - parseTime(b.start));
          }, 0);
          const totalHours = (checkOutTime - checkInTime - breakTime) / 60;
          
          return { ...r, checkOut: time, totalHours: Math.round(totalHours * 10) / 10 };
        }
        return r;
      })
    );
  };

  const startBreak = (employeeId: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setAttendanceRecords(records =>
      records.map(r => {
        if (r.employeeId === employeeId && r.date === today) {
          return { ...r, breaks: [...r.breaks, { start: time, end: '' }] };
        }
        return r;
      })
    );
  };

  const endBreak = (employeeId: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setAttendanceRecords(records =>
      records.map(r => {
        if (r.employeeId === employeeId && r.date === today) {
          const breaks = [...r.breaks];
          if (breaks.length > 0 && !breaks[breaks.length - 1].end) {
            breaks[breaks.length - 1].end = time;
          }
          return { ...r, breaks };
        }
        return r;
      })
    );
  };

  const applyLeave = (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: String(leaveRequests.length + 1),
      status: 'pending',
      appliedOn: today,
    };
    setLeaveRequests([...leaveRequests, newRequest]);
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus, comment?: string) => {
    setLeaveRequests(requests =>
      requests.map(r => {
        if (r.id === id) {
          return { ...r, status, adminComment: comment };
        }
        return r;
      })
    );
  };

  const updateEmployeeProfile = (id: string, updates: Partial<Employee>) => {
    setEmployees(emps =>
      emps.map(e => {
        if (e.id === id) {
          return { ...e, ...updates };
        }
        return e;
      })
    );
  };

  const getEmployeeAttendance = (employeeId: string) => {
    return attendanceRecords.filter(r => r.employeeId === employeeId);
  };

  const getEmployeeLeaves = (employeeId: string) => {
    return leaveRequests.filter(r => r.employeeId === employeeId);
  };

  return (
    <HRContext.Provider value={{
      employees,
      attendanceRecords,
      leaveRequests,
      todayAttendance: null,
      checkIn,
      checkOut,
      startBreak,
      endBreak,
      applyLeave,
      updateLeaveStatus,
      updateEmployeeProfile,
      getEmployeeAttendance,
      getEmployeeLeaves,
    }}>
      {children}
    </HRContext.Provider>
  );
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function useHR() {
  const context = useContext(HRContext);
  if (context === undefined) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
}
