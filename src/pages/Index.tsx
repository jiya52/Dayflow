import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, Users, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <nav className="relative container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Dayflow</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
        
        <div className="relative container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
            Every Workday,<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Perfectly Aligned
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
            Dayflow simplifies HR operations with seamless attendance tracking, leave management, 
            payroll insights, and employee data — all in one modern platform.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 animate-slide-up">
            <Button asChild size="xl" variant="hero">
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Clock, title: 'Attendance', desc: 'Track check-ins with visual timelines' },
            { icon: Calendar, title: 'Leave Management', desc: 'Apply and approve leaves easily' },
            { icon: DollarSign, title: 'Payroll', desc: 'View salary breakdowns instantly' },
            { icon: Users, title: 'Employee Directory', desc: 'Manage all employee data' },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border shadow-card hover:shadow-elevated transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2024 Dayflow. Built for modern HR teams.
        </div>
      </footer>
    </div>
  );
}
