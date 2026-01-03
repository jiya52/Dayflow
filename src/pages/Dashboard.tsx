import { useAuth } from '@/contexts/AuthContext';
import { useHR } from '@/contexts/HRContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  DollarSign,
  User,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { employees, attendanceRecords, leaveRequests, getEmployeeAttendance } = useHR();

  const isAdmin = user?.role === 'admin';
  const today = new Date().toISOString().split('T')[0];
  
  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayAttendance = attendanceRecords.filter(r => r.date === today);
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending');
  const userLeaves = leaveRequests.filter(r => r.employeeId === user?.employeeId);
  const userAttendance = getEmployeeAttendance(user?.employeeId || '');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isAdmin) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your team today.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/employees">
                <Users className="w-4 h-4 mr-2" />
                View All Employees
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-3xl font-bold mt-1">{employees.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                  <p className="text-3xl font-bold mt-1">{todayAttendance.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Leaves</p>
                  <p className="text-3xl font-bold mt-1">{pendingLeaves.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold mt-1">$285k</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Leave Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Pending Leave Requests</CardTitle>
                <CardDescription>{pendingLeaves.length} requests awaiting approval</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/leave">
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingLeaves.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingLeaves.slice(0, 4).map((leave) => (
                    <div key={leave.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(leave.employeeName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{leave.employeeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {leave.startDate} - {leave.endDate}
                        </p>
                      </div>
                      <Badge variant="pending" className="capitalize">{leave.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Attendance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Today's Attendance</CardTitle>
                <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/attendance">
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {todayAttendance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No attendance records yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAttendance.slice(0, 4).map((record) => {
                    const employee = employees.find(e => e.employeeId === record.employeeId);
                    return (
                      <div key={record.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {employee ? getInitials(employee.name) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{employee?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.checkIn} - {record.checkOut || 'Working'}
                          </p>
                        </div>
                        <Badge variant="present">{record.totalHours || 0}h</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Employee Dashboard
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">Track your attendance, leaves, and more.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/profile">
          <Card className="hover:border-primary/50 transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">My Profile</p>
                  <p className="text-sm text-muted-foreground">View & edit details</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/attendance">
          <Card className="hover:border-success/50 transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="font-medium">Attendance</p>
                  <p className="text-sm text-muted-foreground">Check in/out</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/leave">
          <Card className="hover:border-warning/50 transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                  <Calendar className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Leave</p>
                  <p className="text-sm text-muted-foreground">Apply for time off</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/payroll">
          <Card className="hover:border-info/50 transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center group-hover:bg-info/20 transition-colors">
                  <DollarSign className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="font-medium">Payroll</p>
                  <p className="text-sm text-muted-foreground">View salary</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Status</CardTitle>
            <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</CardDescription>
          </CardHeader>
          <CardContent>
            {userAttendance.find(a => a.date === today) ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-success/10">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                    <div>
                      <p className="font-medium">You're checked in</p>
                      <p className="text-sm text-muted-foreground">
                        Since {userAttendance.find(a => a.date === today)?.checkIn}
                      </p>
                    </div>
                  </div>
                  <Badge variant="present">Present</Badge>
                </div>
                <Button asChild className="w-full">
                  <Link to="/attendance">View Full Timeline</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Not checked in yet</p>
                      <p className="text-sm text-muted-foreground">Start your workday</p>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link to="/attendance">Check In Now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">My Leave Requests</CardTitle>
              <CardDescription>{userLeaves.length} total requests</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/leave">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {userLeaves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No leave requests yet</p>
                <Button asChild variant="link" className="mt-2">
                  <Link to="/leave">Apply for leave</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {userLeaves.slice(0, 3).map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium capitalize">{leave.type} Leave</p>
                      <p className="text-sm text-muted-foreground">
                        {leave.startDate} - {leave.endDate}
                      </p>
                    </div>
                    <Badge variant={leave.status}>{leave.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
