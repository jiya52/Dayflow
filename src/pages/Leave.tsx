import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHR, LeaveType, LeaveStatus } from '@/contexts/HRContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Plus,
  Check,
  X,
  FileText,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function Leave() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { leaveRequests, applyLeave, updateLeaveStatus, getEmployeeLeaves } = useHR();
  
  const isAdmin = user?.role === 'admin';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [adminComment, setAdminComment] = useState('');
  
  const [newLeave, setNewLeave] = useState({
    type: 'paid' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });

  const userLeaves = getEmployeeLeaves(user?.employeeId || '');
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending');
  const displayLeaves = isAdmin ? leaveRequests : userLeaves;

  const handleSubmitLeave = () => {
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    applyLeave({
      employeeId: user?.employeeId || '',
      employeeName: user?.name || '',
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      reason: newLeave.reason,
    });

    toast({
      title: 'Leave request submitted',
      description: 'Your request is pending approval.',
    });

    setNewLeave({ type: 'paid', startDate: '', endDate: '', reason: '' });
    setIsDialogOpen(false);
  };

  const handleLeaveAction = () => {
    if (!selectedLeave || !adminComment.trim()) {
      toast({
        title: 'Comment required',
        description: 'Please provide a comment for your decision.',
        variant: 'destructive',
      });
      return;
    }

    updateLeaveStatus(
      selectedLeave, 
      actionType === 'approve' ? 'approved' : 'rejected',
      adminComment
    );

    toast({
      title: `Leave ${actionType === 'approve' ? 'approved' : 'rejected'}`,
      description: 'The employee has been notified.',
    });

    setActionDialogOpen(false);
    setSelectedLeave(null);
    setAdminComment('');
  };

  const openActionDialog = (leaveId: string, action: 'approve' | 'reject') => {
    setSelectedLeave(leaveId);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
      case 'approved': return <Check className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isAdmin ? 'Leave Requests' : 'My Leaves'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin 
              ? `${pendingLeaves.length} pending requests` 
              : 'Apply and track your leave requests'}
          </p>
        </div>
        
        {!isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Apply for Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>
                  Submit your leave request for approval
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select 
                    value={newLeave.type} 
                    onValueChange={(v) => setNewLeave({ ...newLeave, type: v as LeaveType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input 
                      type="date"
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input 
                      type="date"
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Please provide a reason for your leave..."
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitLeave}>
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Admin: Pending Requests */}
      {isAdmin && pendingLeaves.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5 text-warning" />
              Pending Approval
            </CardTitle>
            <CardDescription>These requests need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingLeaves.map((leave) => (
                <div 
                  key={leave.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-card border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(leave.employeeName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{leave.employeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {leave.startDate} - {leave.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="pending" className="capitalize">{leave.type}</Badge>
                    <Button 
                      size="sm" 
                      variant="success"
                      onClick={() => openActionDialog(leave.id, 'approve')}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => openActionDialog(leave.id, 'reject')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isAdmin ? 'All Leave Requests' : 'My Leave History'}
          </CardTitle>
          <CardDescription>
            {displayLeaves.length} total requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayLeaves.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-1">No leave requests</p>
              <p className="text-sm">
                {isAdmin 
                  ? 'No leave requests have been submitted yet' 
                  : 'You haven\'t applied for any leaves yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayLeaves.map((leave) => (
                <div 
                  key={leave.id} 
                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {isAdmin && (
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitials(leave.employeeName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        {isAdmin && (
                          <p className="font-medium">{leave.employeeName}</p>
                        )}
                        <p className={isAdmin ? 'text-sm text-muted-foreground' : 'font-medium'}>
                          <span className="capitalize">{leave.type} Leave</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {leave.startDate} - {leave.endDate}
                        </p>
                        <p className="text-sm mt-2">{leave.reason}</p>
                        {leave.adminComment && (
                          <div className="mt-2 p-2 rounded bg-muted text-sm">
                            <p className="font-medium text-xs text-muted-foreground mb-1">
                              Admin Comment:
                            </p>
                            {leave.adminComment}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={leave.status} className="flex items-center gap-1">
                      {getStatusIcon(leave.status)}
                      {leave.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Leave' : 'Reject Leave'}
            </DialogTitle>
            <DialogDescription>
              Please provide a comment for your decision
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Enter your comment..."
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'approve' ? 'success' : 'destructive'}
              onClick={handleLeaveAction}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
