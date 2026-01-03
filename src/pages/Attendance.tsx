import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR, AttendanceRecord } from '@/contexts/HRContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  Play,
  Square,
  Coffee,
  CheckCircle2,
  Calendar,
  Timer,
} from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    employees, 
    attendanceRecords, 
    checkIn, 
    checkOut, 
    startBreak, 
    endBreak, 
    getEmployeeAttendance 
  } = useHR();
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>(user?.employeeId || '');
  const isAdmin = user?.role === 'admin';
  
  const today = new Date().toISOString().split('T')[0];
  const currentEmployeeId = isAdmin ? selectedEmployee : user?.employeeId || '';
  
  const todayRecord = attendanceRecords.find(
    r => r.employeeId === currentEmployeeId && r.date === today
  );
  
  const employeeAttendance = getEmployeeAttendance(currentEmployeeId);
  const isOnBreak = todayRecord?.breaks.some(b => b.start && !b.end);

  const handleCheckIn = () => {
    if (!currentEmployeeId) return;
    checkIn(currentEmployeeId);
    toast({
      title: 'Checked in!',
      description: `You've started your workday at ${new Date().toLocaleTimeString()}`,
    });
  };

  const handleCheckOut = () => {
    if (!currentEmployeeId) return;
    checkOut(currentEmployeeId);
    toast({
      title: 'Checked out!',
      description: 'Your workday has been recorded.',
    });
  };

  const handleBreakToggle = () => {
    if (!currentEmployeeId) return;
    if (isOnBreak) {
      endBreak(currentEmployeeId);
      toast({ title: 'Break ended', description: 'Back to work!' });
    } else {
      startBreak(currentEmployeeId);
      toast({ title: 'Break started', description: 'Enjoy your break!' });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Timeline visualization
  const renderTimeline = (record: AttendanceRecord) => {
    const workdayStart = 8; // 8 AM
    const workdayEnd = 19; // 7 PM
    const totalMinutes = (workdayEnd - workdayStart) * 60;
    
    const parseTimeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return (hours - workdayStart) * 60 + minutes;
    };

    const checkInPos = record.checkIn ? (parseTimeToMinutes(record.checkIn) / totalMinutes) * 100 : 0;
    const checkOutPos = record.checkOut ? (parseTimeToMinutes(record.checkOut) / totalMinutes) * 100 : 100;

    return (
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>8:00 AM</span>
          <span>12:00 PM</span>
          <span>4:00 PM</span>
          <span>7:00 PM</span>
        </div>
        <div className="relative h-8 bg-muted rounded-full overflow-hidden">
          {/* Working time bar */}
          {record.checkIn && (
            <div 
              className="absolute h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              style={{
                left: `${Math.max(0, checkInPos)}%`,
                width: `${Math.min(100, checkOutPos - checkInPos)}%`,
              }}
            />
          )}
          
          {/* Break markers */}
          {record.breaks.map((b, i) => {
            if (!b.start) return null;
            const breakStart = (parseTimeToMinutes(b.start) / totalMinutes) * 100;
            const breakEnd = b.end ? (parseTimeToMinutes(b.end) / totalMinutes) * 100 : breakStart + 5;
            return (
              <div
                key={i}
                className="absolute h-full bg-warning/50"
                style={{
                  left: `${Math.max(0, breakStart)}%`,
                  width: `${Math.min(100 - breakStart, breakEnd - breakStart)}%`,
                }}
              />
            );
          })}
          
          {/* Check-in marker */}
          {record.checkIn && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-success rounded-full ring-2 ring-card"
              style={{ left: `${Math.max(0, checkInPos)}%` }}
            />
          )}
          
          {/* Check-out marker */}
          {record.checkOut && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-destructive rounded-full ring-2 ring-card"
              style={{ left: `${Math.min(100, checkOutPos)}%` }}
            />
          )}
        </div>
        
        <div className="flex items-center gap-6 mt-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Check-in: {record.checkIn || '--:--'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Check-out: {record.checkOut || '--:--'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Breaks: {record.breaks.length}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Manage employee attendance' : 'Track your workday'}
          </p>
        </div>
        
        {isAdmin && (
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(emp => (
                <SelectItem key={emp.employeeId} value={emp.employeeId}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Today's Attendance Card */}
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Workday
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </CardDescription>
            </div>
            {todayRecord && (
              <Badge variant="present" className="text-sm py-1 px-3">
                <Timer className="w-4 h-4 mr-1" />
                {todayRecord.totalHours || 0} hours
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Action Buttons */}
          {!isAdmin && (
            <div className="flex flex-wrap gap-3 mb-6">
              {!todayRecord?.checkIn ? (
                <Button onClick={handleCheckIn} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Check In
                </Button>
              ) : !todayRecord?.checkOut ? (
                <>
                  <Button onClick={handleCheckOut} variant="destructive" size="lg" className="gap-2">
                    <Square className="w-5 h-5" />
                    Check Out
                  </Button>
                  <Button 
                    onClick={handleBreakToggle} 
                    variant={isOnBreak ? 'success' : 'secondary'} 
                    size="lg" 
                    className="gap-2"
                  >
                    <Coffee className="w-5 h-5" />
                    {isOnBreak ? 'End Break' : 'Start Break'}
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-medium">Workday completed</span>
                </div>
              )}
            </div>
          )}

          {/* Timeline Visualization */}
          {todayRecord ? (
            renderTimeline(todayRecord)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No attendance recorded yet for today</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {employeeAttendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employeeAttendance.slice(0, 7).map((record) => (
                <div 
                  key={record.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.checkIn} - {record.checkOut || 'In Progress'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={record.status === 'half-day' ? 'halfday' : record.status}>
                      {record.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      {record.totalHours || 0}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin: All Employees Today */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>All Employees - Today</CardTitle>
            <CardDescription>Overview of today's attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.map((emp) => {
                const empRecord = attendanceRecords.find(
                  r => r.employeeId === emp.employeeId && r.date === today
                );
                return (
                  <div 
                    key={emp.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">{emp.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {empRecord ? (
                        <>
                          <span className="text-sm text-muted-foreground">
                            {empRecord.checkIn} - {empRecord.checkOut || 'Working'}
                          </span>
                          <Badge variant={empRecord.status === 'half-day' ? 'halfday' : empRecord.status}>
                            {empRecord.status}
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="absent">Not checked in</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
