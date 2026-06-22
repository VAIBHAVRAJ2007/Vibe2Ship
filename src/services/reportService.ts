import { db, collection, getDocs, query, orderBy } from '@/lib/firebase';
import { Report } from '@/types/report';

const REPORTS_COLLECTION = 'reports';

export const reportService = {
  /**
   * Fetches all reports sorted by createdAt descending
   * @returns Promise<Report[]> Array of reports
   */
  async getAllReports(): Promise<Report[]> {
    try {
      const q = query(
        collection(db, REPORTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reports: Report[] = [];
      
      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        } as Report);
      });
      
      return reports;
    } catch (error) {
      console.error('Error fetching reports from Firestore:', error);
      throw error;
    }
  }
};
