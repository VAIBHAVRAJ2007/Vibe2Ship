import { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { db, collection, getDocs } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';

export default function MapView() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    async function fetchReports() {
      try {
        const snapshot = await getDocs(collection(db, 'reports'));
        const items: any[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.location) {
            items.push({ id: doc.id, ...data });
          }
        });
        setReports(items);
      } catch (error) {
        console.error(error);
      }
    }
    fetchReports();
  }, []);

  const getPinColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#ef4444'; // red-500
      case 'High': return '#f97316'; // orange-500
      case 'Medium': return '#eab308'; // yellow-500
      default: return '#22c55e'; // green-500
    }
  };

  // Default to a generic coordinate if none available
  const defaultCenter = reports.length > 0 ? reports[0].location : { lat: 40.7128, lng: -74.0060 };

  return (
    <div className="h-[calc(100vh-6rem)] md:h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interactive Map</h1>
        <p className="text-muted-foreground">Geospatial overview of reported civic infrastructure issues.</p>
      </div>

      <Card className="flex-1 overflow-hidden relative">
        <CardContent className="p-0 h-full w-full">
          {/* Note: In a real environment, provide a valid API Key in App wrapping or here. 
              Using placeholder pattern. If missing, it renders map without API. */}
          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY"}>
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={11}
              mapId="DEMO_MAP_ID"
              disableDefaultUI={false}
            >
              {reports.map((report) => (
                <AdvancedMarker 
                  key={report.id} 
                  position={report.location}
                  title={report.title}
                >
                  <Pin 
                    background={getPinColor(report.severity)} 
                    borderColor={'#000'} 
                    glyphColor={'#fff'} 
                  />
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        </CardContent>
      </Card>
      
      {/* Missing Key Warning */}
      {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
        <div className="text-xs text-center text-muted-foreground bg-muted p-2 rounded">
          Warning: VITE_GOOGLE_MAPS_API_KEY is not configured. The map may display a "Development purposes only" watermark.
        </div>
      )}
    </div>
  );
}
