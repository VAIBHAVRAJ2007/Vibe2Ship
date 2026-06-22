import { useEffect, useState } from 'react';
import { db, collection, getDocs, updateDoc, doc, orderBy, query } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: any[] = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      setReports(items);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: newStatus
      });
      setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      toast.success('Status updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Moderation</h1>
        <p className="text-slate-500 font-medium tracking-tight mt-1">Manage and triage community reports.</p>
      </div>

      <Card className="rounded-xl shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">All Civic Issues</CardTitle>
          <CardDescription className="text-slate-500">Review, assign, and update status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700">Issue</TableHead>
                  <TableHead className="font-semibold text-slate-700">Category</TableHead>
                  <TableHead className="font-semibold text-slate-700">Risk</TableHead>
                  <TableHead className="font-semibold text-slate-700">Department</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-slate-500 font-medium">
                      No reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id} className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        <div className="line-clamp-1 max-w-[200px]">{report.title}</div>
                        <div className="text-[11px] text-slate-500 tracking-tight mt-0.5 font-medium">{report.locationName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-slate-600 border-slate-200 shadow-none px-2 py-0.5 tracking-tight font-medium">
                          {report.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium text-sm">
                          <span className={`w-2 h-2 rounded-full ${report.severity === 'Critical' ? 'bg-red-500' : report.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                          {report.risk}/10
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 font-medium text-sm">
                        {report.department || 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={report.status} 
                          onValueChange={(val) => handleStatusChange(report.id, val)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs font-semibold bg-white border-slate-200 shadow-none">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="border-slate-200 shadow-lg">
                            <SelectItem value="Reported" className="font-medium focus:bg-slate-100 cursor-pointer">Reported</SelectItem>
                            <SelectItem value="AI Verified" className="font-medium text-blue-600 focus:bg-slate-100 cursor-pointer">AI Verified</SelectItem>
                            <SelectItem value="Assigned" className="font-medium focus:bg-slate-100 cursor-pointer">Assigned</SelectItem>
                            <SelectItem value="In Progress" className="font-medium focus:bg-slate-100 cursor-pointer">In Progress</SelectItem>
                            <SelectItem value="Resolved" className="font-medium text-emerald-600 focus:bg-slate-100 cursor-pointer">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
