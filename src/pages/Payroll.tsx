import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR } from '@/contexts/HRContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Edit,
} from 'lucide-react';

export default function Payroll() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { employees, updateEmployeeProfile } = useHR();
  
  const isAdmin = user?.role === 'admin';
  const [selectedEmployee, setSelectedEmployee] = useState<string>(user?.employeeId || '');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [salaryUpdate, setSalaryUpdate] = useState({
    basic: 0,
    allowances: 0,
    deductions: 0,
  });

  const currentEmployee = employees.find(e => e.employeeId === (isAdmin ? selectedEmployee : user?.employeeId));
  const salary = currentEmployee?.salary || { basic: 0, allowances: 0, deductions: 0 };
  const netSalary = salary.basic + salary.allowances - salary.deductions;

  const openEditDialog = (employeeId: string) => {
    const emp = employees.find(e => e.employeeId === employeeId);
    if (emp) {
      setEditingEmployee(employeeId);
      setSalaryUpdate(emp.salary);
      setEditDialogOpen(true);
    }
  };

  const handleUpdateSalary = () => {
    if (!editingEmployee) return;
    
    const emp = employees.find(e => e.employeeId === editingEmployee);
    if (emp) {
      updateEmployeeProfile(emp.id, { salary: salaryUpdate });
      toast({
        title: 'Salary updated',
        description: 'The employee\'s salary has been updated.',
      });
      setEditDialogOpen(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Payroll</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Manage employee compensation' : 'View your salary details'}
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

      {/* Salary Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Salary</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(netSalary)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Basic Salary</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(salary.basic)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Allowances</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(salary.allowances)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deductions</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(salary.deductions)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Salary Breakdown</CardTitle>
            <CardDescription>
              {currentEmployee?.name || 'Select an employee'} - {currentEmployee?.position}
            </CardDescription>
          </div>
          {isAdmin && currentEmployee && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openEditDialog(currentEmployee.employeeId)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Salary
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-success" />
                <span className="font-medium">Basic Salary</span>
              </div>
              <span className="font-bold">{formatCurrency(salary.basic)}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-info/5 border border-info/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-info" />
                <span className="font-medium">Allowances</span>
              </div>
              <span className="font-bold text-info">+{formatCurrency(salary.allowances)}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-destructive" />
                <span className="font-medium">Deductions</span>
              </div>
              <span className="font-bold text-destructive">-{formatCurrency(salary.deductions)}</span>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <PiggyBank className="w-5 h-5 text-primary" />
                  <span className="font-bold">Net Salary</span>
                </div>
                <span className="text-xl font-bold text-primary">{formatCurrency(netSalary)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted text-sm text-muted-foreground">
            <p className="font-medium mb-1">Monthly Payment Schedule</p>
            <p>Salary is credited on the last working day of each month.</p>
          </div>
        </CardContent>
      </Card>

      {/* Admin: All Employees Payroll */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>All Employees Payroll</CardTitle>
            <CardDescription>Overview of employee compensation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.map((emp) => {
                const empNet = emp.salary.basic + emp.salary.allowances - emp.salary.deductions;
                return (
                  <div 
                    key={emp.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(emp.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">{emp.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(empNet)}</p>
                        <p className="text-xs text-muted-foreground">Net / month</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => openEditDialog(emp.employeeId)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Salary Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Salary</DialogTitle>
            <DialogDescription>
              Update the employee's salary structure
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Basic Salary ($)</Label>
              <Input 
                type="number"
                value={salaryUpdate.basic}
                onChange={(e) => setSalaryUpdate({ ...salaryUpdate, basic: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Allowances ($)</Label>
              <Input 
                type="number"
                value={salaryUpdate.allowances}
                onChange={(e) => setSalaryUpdate({ ...salaryUpdate, allowances: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Deductions ($)</Label>
              <Input 
                type="number"
                value={salaryUpdate.deductions}
                onChange={(e) => setSalaryUpdate({ ...salaryUpdate, deductions: Number(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSalary}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
