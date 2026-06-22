import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { db, collection, getDocs, query, orderBy } from '@/lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0, critical: 0 });
  const [reports, setReports] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        let open = 0;
        let resolved = 0;
        let critical = 0;
        const fetchedReports: any[] = [];
        
        const catMap: Record<string, number> = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedReports.push({ id: doc.id, ...data });
          if (data.status === 'Resolved') resolved++;
          else open++;

          if (data.severity === 'Critical') critical++;

          const cat = data.category || 'Other';
          catMap[cat] = (catMap[cat] || 0) + 1;
        });

        // Seed with data if it's empty to match the design aesthetics (demo sake)
        if (fetchedReports.length === 0) {
           setStats({ total: 142, open: 45, resolved: 56, critical: 12 });
           setReports([{ id: '1', title: 'Burst Pipe - Lincoln St', category: 'Water Supply', severity: 'Critical', risk: 9, status: 'AI Verified'}, { id: '2', title: 'Garbage Overload - Market Sq', category: 'Waste Management', severity: 'High', risk: 7, status: 'In Progress'}]);
        } else {
           setStats({ total: fetchedReports.length, open, resolved, critical });
           setReports(fetchedReports.slice(0, 5));
        }

        setChartData(Object.keys(catMap).map(key => ({ name: key, count: catMap[key] })));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
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
    
      {/* Activity Table mimicking the professional preview */}
      <Card className="rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
         <table className="w-full text-left text-sm">
           <thead className="bg-[#F8FAFC] border-b border-slate-200">
             <tr>
               <th className="px-6 py-3 font-semibold text-slate-600 tracking-tight">Issue Title</th>
               <th className="px-6 py-3 font-semibold text-slate-600 tracking-tight">Category</th>
               <th className="px-6 py-3 font-semibold text-slate-600 tracking-tight">Priority</th>
               <th className="px-6 py-3 font-semibold text-slate-600 tracking-tight border-r border-[#F8FAFC]">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 bg-white">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 tracking-tight max-w-[200px] truncate">{report.title}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium text-xs">{report.category}</td>
                  <td className="px-6 py-4">
                    {report.severity === 'Critical' && <span className="px-2.5 py-1 bg-red-100/80 text-red-700 rounded text-[10px] font-bold uppercase tracking-widest">Critical</span>}
                    {report.severity === 'High' && <span className="px-2.5 py-1 bg-orange-100/80 text-orange-700 rounded text-[10px] font-bold uppercase tracking-widest">High</span>}
                    {report.severity === 'Medium' && <span className="px-2.5 py-1 bg-yellow-100/80 text-yellow-700 rounded text-[10px] font-bold uppercase tracking-widest">Medium</span>}
                    {(!report.severity || report.severity === 'Low') && <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest">Low</span>}
                  </td>
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${report.status === 'Resolved' ? 'bg-emerald-500' : report.status === 'AI Verified' ? 'bg-blue-500' : 'bg-orange-500 animate-pulse'}`}></div>
                    <span className="text-xs font-semibold tracking-tight text-slate-700">{report.status || 'Reported'}</span>
                  </td>
                </tr>
              ))}
           </tbody>
         </table>
        </div>
      </Card>
    </div>
  );
}
