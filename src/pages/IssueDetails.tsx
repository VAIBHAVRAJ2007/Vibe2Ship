import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      const docRef = doc(db, 'reports', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setReport({ id: snapshot.id, ...snapshot.data() });
      }
    }
    fetchReport();
  }, [id]);

  if (!report) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <Card className="overflow-hidden">
        {report.imageUrl && (
          <div className="w-full h-64 bg-muted">
            <img src={report.imageUrl} alt="Issue" className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader>
          <div className="flex gap-2 mb-2">
            <Badge>{report.category}</Badge>
            <Badge variant="outline">{report.status}</Badge>
          </div>
          <CardTitle className="text-2xl">{report.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <MapPin className="w-4 h-4 mr-1" /> {report.locationName || 'Location unknown'}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{report.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium">Reported By</p>
              <p className="text-sm text-muted-foreground">{report.reporterName || 'Citizen'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">{report.createdAt ? formatDistanceToNow(report.createdAt.toDate(), {addSuffix: true}) : 'Just now'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Severity</p>
              <p className="text-sm text-muted-foreground">{report.severity}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Department</p>
              <p className="text-sm text-muted-foreground">{report.department || 'Unassigned'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
