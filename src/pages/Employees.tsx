import { useState } from 'react';
import { useHR } from '@/contexts/HRContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Search,
  Mail,
  Phone,
  Building2,
  Edit,
  Eye,
  X,
} from 'lucide-react';

export default function Employees() {
  const { toast } = useToast();
  const { employees, updateEmployeeProfile } = useHR();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [editData, setEditData] = useState({
    phone: '',
    address: '',
    department: '',
    position: '',
  });

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentEmployee = employees.find(e => e.id === selectedEmployee);

  const openEmployeeDialog = (employeeId: string, mode: 'view' | 'edit') => {
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      setSelectedEmployee(employeeId);
      setViewMode(mode);
      setEditData({
        phone: emp.phone || '',
        address: emp.address || '',
        department: emp.department,
        position: emp.position,
      });
    }
  };

  const handleSaveEmployee = () => {
    if (!selectedEmployee) return;
    
    updateEmployeeProfile(selectedEmployee, editData);
    toast({
      title: 'Employee updated',
      description: 'The employee profile has been updated.',
    });
    setSelectedEmployee(null);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground mt-1">
            Manage all {employees.length} employees
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Employees Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((emp) => (
          <Card key={emp.id} className="hover:shadow-elevated transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4">
                  <AvatarImage src={emp.avatar} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {getInitials(emp.name)}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-semibold text-lg">{emp.name}</h3>
                <p className="text-sm text-muted-foreground">{emp.position}</p>
                
                <Badge variant={emp.role === 'admin' ? 'default' : 'secondary'} className="mt-2 capitalize">
                  {emp.role}
                </Badge>
                
                <div className="w-full mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{emp.department}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4 w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEmployeeDialog(emp.id, 'view')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEmployeeDialog(emp.id, 'edit')}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No employees found</p>
          <p className="text-sm">Try adjusting your search query</p>
        </div>
      )}

      {/* Employee Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewMode === 'view' ? 'Employee Details' : 'Edit Employee'}
            </DialogTitle>
            <DialogDescription>
              {currentEmployee?.employeeId} - {currentEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          
          {currentEmployee && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={currentEmployee.avatar} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {getInitials(currentEmployee.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{currentEmployee.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentEmployee.email}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input 
                    value={viewMode === 'edit' ? editData.department : currentEmployee.department}
                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                    disabled={viewMode === 'view'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input 
                    value={viewMode === 'edit' ? editData.position : currentEmployee.position}
                    onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                    disabled={viewMode === 'view'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={viewMode === 'edit' ? editData.phone : currentEmployee.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    disabled={viewMode === 'view'}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Input 
                    value={viewMode === 'edit' ? editData.address : currentEmployee.address || ''}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    disabled={viewMode === 'view'}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
              {viewMode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {viewMode === 'edit' && (
              <Button onClick={handleSaveEmployee}>
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
