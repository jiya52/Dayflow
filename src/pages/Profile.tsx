import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR } from '@/contexts/HRContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Building2,
  Edit,
  Save,
  X,
  FileText,
  Shield,
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { employees, updateEmployeeProfile } = useHR();
  
  const isAdmin = user?.role === 'admin';
  const currentEmployee = employees.find(e => e.employeeId === user?.employeeId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    phone: currentEmployee?.phone || '',
    address: currentEmployee?.address || '',
  });

  const handleSave = () => {
    if (!currentEmployee) return;
    
    updateEmployeeProfile(currentEmployee.id, {
      phone: editData.phone,
      address: editData.address,
    });
    
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
    });
    
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!currentEmployee) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Employee not found</p>
      </div>
    );
  }

  const netSalary = currentEmployee.salary.basic + currentEmployee.salary.allowances - currentEmployee.salary.deductions;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">View and manage your profile information</p>
        </div>
        
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-primary/70" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
            <Avatar className="w-32 h-32 border-4 border-card shadow-lg">
              <AvatarImage src={currentEmployee.avatar} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {getInitials(currentEmployee.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{currentEmployee.name}</h2>
                <Badge variant={isAdmin ? 'default' : 'secondary'} className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {currentEmployee.role}
                </Badge>
              </div>
              <p className="text-muted-foreground">{currentEmployee.position}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Employee ID: {currentEmployee.employeeId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="job">Job Details</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Your personal contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input value={currentEmployee.email} disabled className="bg-muted" />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input 
                    value={isEditing ? editData.phone : currentEmployee.phone || ''} 
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input 
                    value={isEditing ? editData.address : currentEmployee.address || ''} 
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                    placeholder="Enter address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
              <CardDescription>Your employment information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium">{currentEmployee.position}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{currentEmployee.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Join Date</p>
                    <p className="font-medium">
                      {new Date(currentEmployee.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p className="font-medium">{currentEmployee.employeeId}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Salary Structure</CardTitle>
              <CardDescription>Your compensation breakdown (read-only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-success" />
                    <span className="font-medium">Basic Salary</span>
                  </div>
                  <span className="font-bold">{formatCurrency(currentEmployee.salary.basic)}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-info/5 border border-info/20">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-info" />
                    <span className="font-medium">Allowances</span>
                  </div>
                  <span className="font-bold text-info">+{formatCurrency(currentEmployee.salary.allowances)}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-destructive" />
                    <span className="font-medium">Deductions</span>
                  </div>
                  <span className="font-bold text-destructive">-{formatCurrency(currentEmployee.salary.deductions)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="font-bold">Net Salary</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(netSalary)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents</CardTitle>
              <CardDescription>Your employment documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {['Employment Contract', 'ID Proof', 'Tax Documents', 'Certificates'].map((doc) => (
                  <div 
                    key={doc}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doc}</p>
                      <p className="text-sm text-muted-foreground">PDF Document</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-muted text-center">
                <p className="text-sm text-muted-foreground">
                  Document management features coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
