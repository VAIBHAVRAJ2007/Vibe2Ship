import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { reportService } from '@/services/reportService';
import { Report } from '@/types/report';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0, critical: 0 });
  const [reports, setReports] = useState<Report[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedReports = await reportService.getAllReports();
        
        let open = 0;
        let resolved = 0;
        let critical = 0;
        
        const catMap: Record<string, number> = {};

        fetchedReports.forEach((data) => {
          if (data.status === 'Resolved') resolved++;
          else open++;

          // Assuming severity doesn't formally exist on Report yet but we had it before, we'll gracefully ignore it if missing, or we can check
          if ((data as any).severity === 'Critical') critical++;

          const cat = data.category || 'Other';
          catMap[cat] = (catMap[cat] || 0) + 1;
        });

        setStats({ total: fetchedReports.length, open, resolved, critical });
        setReports(fetchedReports);
        setChartData(Object.keys(catMap).map(key => ({ name: key, count: catMap[key] })));
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Reported This Week</CardTitle>
            <Activity className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <p className="text-emerald-600 font-medium text-xs mt-2 tracking-tight">↑ 12% from last week</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">AI Auto-Verified</CardTitle>
            <Zap className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">89%</div>
            <p className="text-slate-400 text-xs mt-2 tracking-tight">Average Gemini confidence</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Resolved Issues</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{stats.resolved}</div>
            <p className="text-emerald-600 font-medium text-xs mt-2 tracking-tight">+4 today</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Active Citizens</CardTitle>
            <Activity className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">1,204</div>
            <p className="text-slate-400 text-xs mt-2 tracking-tight">Across 12 sectors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2 rounded-xl shadow-sm flex flex-col h-[420px]">
          <CardHeader className="border-b border-slate-100 py-4 px-6 flex flex-row justify-between items-center space-y-0">
            <CardTitle className="text-base font-bold text-slate-800">Civic Graph</CardTitle>
            <div className="flex space-x-2">
              <span className="px-2 py-1 rounded border border-slate-200 text-xs text-slate-600 bg-white">Filters: All Issues</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-6 relative flex flex-col">
            <div className="w-full h-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} allowDecimals={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full w-full relative">
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full" style={{backgroundImage: "radial-gradient(#64748b 1px, transparent 1px)", backgroundSize: "20px 20px"}}></div>
                  </div>
                  <div className="m-auto text-muted-foreground text-sm z-10">No robust data yet. Submit reports to generate graph.</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl flex flex-col h-[420px] text-white overflow-hidden">
          <div className="p-4 bg-slate-800/80 border-b border-white/10 flex items-center space-x-3">
            <div className="w-5 h-5 bg-gradient-to-tr from-blue-400 to-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <h2 className="font-bold tracking-tight text-white/90">Gemini AI Insights</h2>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Predictive Hotspot</p>
              <p className="text-sm text-slate-200">Sector 12 drainage systems showing signs of early failure based on last 48h reported images.</p>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Recent Verification</p>
              <div className="flex items-center space-x-3 mt-2">
                 <div className="w-10 h-10 bg-slate-700 rounded border border-slate-600 flex items-center justify-center">
                    <Zap className="text-emerald-400 w-4 h-4" />
                 </div>
                 <div className="flex-1">
                   <p className="text-xs font-bold text-white">Visual Risk: #A124</p>
                   <p className="text-[10px] text-emerald-400 mt-0.5">Confidence Score: 98.4%</p>
                 </div>
              </div>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Admin Alert</p>
              <p className="text-sm text-slate-200 font-medium tracking-tight mt-1">Duplicate report detected at Park Ave. Auto-merged by Gemini.</p>
            </div>
          </div>
        </div>
      </div>
    
      {/* Report Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Recent Reports</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-48 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <div className="flex flex-col items-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
              <p>Loading reports...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-48 bg-red-50 border border-red-100 rounded-xl text-red-600">
            <p>{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex justify-center items-center h-48 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500">No Reports Found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id} className="rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                {report.imageUrl ? (
                  <img src={report.imageUrl} alt={report.title} className="h-48 w-full object-cover" />
                ) : (
                  <div className="h-48 w-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <span>No Image</span>
                  </div>
                )}
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest">{report.category}</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{report.status || 'Reported'}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-tight mb-2">{report.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{report.description}</p>
                  <div className="text-xs text-slate-500 font-medium flex items-center mt-auto pt-4 border-t border-slate-50">
                    <Clock className="w-3 h-3 mr-1" />
                    {report.createdAt && typeof report.createdAt.toDate === 'function' ? report.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
