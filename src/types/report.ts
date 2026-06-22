export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  status: string;
  userId: string;
  createdAt: any; // Firestore Timestamp
  reporterName?: string;
  location?: { lat: number, lng: number };
  locationName?: string;
  upvotes?: number;
  downvotes?: number;
}
