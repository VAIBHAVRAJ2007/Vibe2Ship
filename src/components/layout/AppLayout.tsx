import { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, List, PlusCircle, BarChart3, LogOut, ShieldAlert, User, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
  { name: 'Report Issue', path: '/app/report', icon: PlusCircle },
  { name: 'Community Feed', path: '/app/feed', icon: List },
  { name: 'Map View', path: '/app/map', icon: Map },
  { name: 'Analytics', path: '/app/analytics', icon: BarChart3 },
];

export function AppLayout() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex h-[72px] items-center px-6 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3 text-white shadow-sm">
          <span className="font-bold text-sm tracking-tight text-white">CM</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-white">CityMind AI</span>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 transition-all ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
              end={item.path === '/app'}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
          <NavLink
              to="/app/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 transition-all ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white mt-4 border border-slate-800'
                }`
              }
            >
              <ShieldAlert className="h-5 w-5" />
              Admin Panel
          </NavLink>
        </nav>
      </div>
      <div className="p-4 bg-slate-800/50 m-4 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold leading-none">Citizen Rank</span>
          <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest leading-none">Gold</span>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30">
            <User className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex flex-col text-sm flex-1 min-w-0">
            <span className="font-semibold text-slate-200 truncate">{user?.displayName || 'Citizen'}</span>
            <span className="text-[10px] text-slate-400 truncate uppercase mt-0.5 tracking-wider">{user?.email || 'user@example.com'}</span>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start mt-4 text-slate-400 hover:bg-slate-800 hover:text-white h-9" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground md:flex-row font-sans">
      {/* Mobile nav */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <div className="flex items-center gap-2 font-bold text-card-foreground">
           <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
             <span className="font-bold text-sm">CM</span>
           </div>
          <span>CityMind AI</span>
        </div>
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu className="h-5 w-5 text-muted-foreground" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-none bg-slate-900">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop nav */}
      <div className="hidden border-r border-slate-200 bg-slate-900 md:block md:w-64 lg:w-72 shrink-0">
        <SidebarContent />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F1F5F9]">
        {/* Top Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-border px-8 items-center justify-between shrink-0">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Central Dashboard</h1>
            <span className="ml-4 px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-widest">System Live</span>
          </div>
          <div className="flex items-center space-x-4">
             <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold h-9" onClick={() => navigate('/app/report')}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Report New Issue
             </Button>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
