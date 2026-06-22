import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, orderBy, updateDoc, doc, arrayUnion } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, MapPin, MessageSquare, AlertTriangle, Filter, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CommunityFeed() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: any[] = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      setReports(items);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load community feed.');
    } finally {
      setLoading(false);
    }
  };

  const verifyIssue = async (reportId: string, currentVerifications: number) => {
    try {
      if (!user) return toast.error("Must be logged in to verify");
      await updateDoc(doc(db, 'reports', reportId), {
        verifications: currentVerifications + 1,
        verifiedBy: arrayUnion(user.uid)
      });
      toast.success('Successfully verified issue!');
      fetchReports();
    } catch (error) {
      console.error(error);
      toast.error('Failed to verify.');
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch(sev) {
      case 'Critical': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-2 rounded font-bold uppercase text-[10px] tracking-widest shadow-none">Critical</Badge>;
      case 'High': return <Badge variant="destructive" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none px-2 rounded font-bold uppercase text-[10px] tracking-widest shadow-none">High</Badge>;
      case 'Medium': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none px-2 rounded font-bold uppercase text-[10px] tracking-widest shadow-none">Medium</Badge>;
      default: return <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none px-2 rounded font-bold uppercase text-[10px] tracking-widest shadow-none">Low</Badge>;
    }
  };

  const filteredReports = filter === 'All' ? reports : reports.filter(r => r.category === filter);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Active Issues</h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Verify and track civic issues in your area.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">
          <Filter className="w-4 h-4 text-slate-400" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] border-none shadow-none h-8 font-medium text-slate-700 focus:ring-0 px-2">
              <SelectValue placeholder="Filter Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Roads">Roads</SelectItem>
              <SelectItem value="Water Supply">Water Supply</SelectItem>
              <SelectItem value="Waste Management">Waste</SelectItem>
              <SelectItem value="Electricity">Electricity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium">Loading feed...</div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl text-slate-500 font-medium shadow-sm">
          No reports found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md border border-slate-200 rounded-xl bg-white group">
              {report.imageUrl && (
                <div className="h-48 w-full block shrink-0 overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}
              <CardHeader className="pb-3 flex-1 px-6 pt-5">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="text-xs text-slate-500 font-medium border-slate-200 shadow-none px-2 py-0.5 tracking-tight">
                    {report.category}
                  </Badge>
                  {getSeverityBadge(report.severity)}
                </div>
                <CardTitle className="text-xl line-clamp-2 leading-tight font-bold text-slate-900">{report.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{report.locationName || 'Location hidden'}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-5 px-6">
                <p className="text-sm text-slate-600 line-clamp-3 mb-4 font-medium leading-relaxed">
                   {report.description}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  {report.status && (
                     <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md">
                        {report.status === 'Resolved' ? (
                          <CheckCircle2 className="text-emerald-500 w-3.5 h-3.5" />
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${report.status === 'AI Verified' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                        )}
                        <span className="text-[11px] font-bold text-slate-600 tracking-tight">{report.status}</span>
                     </div>
                  )}
                  {report.risk > 7 && (
                    <Badge variant="destructive" className="bg-red-50 text-red-600 border border-red-100 shadow-none px-2 rounded font-medium text-[11px]">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Risk Lvl {report.risk}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex flex-col items-start gap-4 px-6 py-5 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between w-full items-center text-[11px] text-slate-500 font-medium">
                  <span className="text-slate-800 tracking-tight">By {report.reporterName || 'Citizen'}</span>
                  <span>{report.createdAt ? formatDistanceToNow(report.createdAt.toDate(), {addSuffix: true}) : 'Just now'}</span>
                </div>
                <div className="flex gap-2 w-full">
                  <Button 
                    variant={report.verifiedBy?.includes(user?.uid) ? "secondary" : "outline"} 
                    className={`flex-1 text-xs font-semibold h-9 shadow-none ${report.verifiedBy?.includes(user?.uid) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white hover:bg-slate-100'}`}
                    size="sm"
                    onClick={() => verifyIssue(report.id, report.verifications || 0)}
                    disabled={report.verifiedBy?.includes(user?.uid)}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    {report.verifiedBy?.includes(user?.uid) ? 'Verified' : `Verify (${report.verifications || 0})`}
                  </Button>
                  <Button variant="outline" className="px-3 h-9 text-slate-500 bg-white" size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
