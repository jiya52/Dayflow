import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    
    if (result.success) {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Sign in failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center p-12">
        <div className="max-w-md text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-sidebar-primary flex items-center justify-center">
              <Clock className="w-8 h-8 text-sidebar-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-sidebar-foreground">Dayflow</h1>
              <p className="text-sm text-sidebar-foreground/70">Every Workday, Perfectly Aligned</p>
            </div>
          </div>
          
          <div className="space-y-6 text-sidebar-foreground/80">
            <div className="p-6 rounded-2xl bg-sidebar-accent/50 backdrop-blur">
              <h3 className="font-semibold text-lg mb-2 text-sidebar-foreground">Streamline Your HR</h3>
              <p className="text-sm leading-relaxed">
                Manage attendance, leaves, payroll, and employee data in one seamless platform designed for modern teams.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-sidebar-accent/30">
                <div className="text-2xl font-bold text-sidebar-primary">500+</div>
                <div className="text-xs text-sidebar-foreground/60">Companies</div>
              </div>
              <div className="p-4 rounded-xl bg-sidebar-accent/30">
                <div className="text-2xl font-bold text-accent">50k+</div>
                <div className="text-xs text-sidebar-foreground/60">Employees</div>
              </div>
              <div className="p-4 rounded-xl bg-sidebar-accent/30">
                <div className="text-2xl font-bold text-sidebar-primary">99.9%</div>
                <div className="text-xs text-sidebar-foreground/60">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md border-0 shadow-elevated animate-slide-up">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Dayflow</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full h-11" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium text-muted-foreground mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><span className="font-medium">Employee:</span> john.doe@dayflow.com / password123</p>
                <p><span className="font-medium">Admin:</span> sarah.admin@dayflow.com / admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
