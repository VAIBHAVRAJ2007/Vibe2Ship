import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MapPin, UploadCloud, Loader2, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db, collection, addDoc, serverTimestamp, storage, ref, uploadBytes, getDownloadURL } from '@/lib/firebase';

export default function ReportIssue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');

  // AI-Filled Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [risk, setRisk] = useState('');
  const [department, setDepartment] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedInfo = e.target.files[0];
      setFile(selectedInfo);
      setPreview(URL.createObjectURL(selectedInfo));
    }
  };

  const captureLocation = () => {
    if (navigator.geolocation) {
      toast.info('Fetching location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationName(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          toast.success('Location acquired');
        },
        (error) => {
          toast.error('Could not get location. ' + error.message);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload an image first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      if (userDescription) {
        formData.append('userDescription', userDescription);
      }

      const res = await fetch('/api/analyze-issue', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data = await res.json();
      setTitle(data.title || '');
      setDescription(data.description || '');
      setCategory(data.category || '');
      setSeverity(data.severity || '');
      setRisk(data.risk?.toString() || '');
      setDepartment(data.department || '');
      
      toast.success('AI Analysis complete. Please review the details.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze the issue. Please try again or fill manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !file) {
      toast.error('Please fill required fields and upload an image.');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = '';
      if (file) {
        setLoadingStatus('Processing image...');
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setLoadingStatus('Saving report...');
      await addDoc(collection(db, 'reports'), {
        title,
        description,
        category,
        severity,
        risk: parseInt(risk) || 0,
        department,
        imageUrl,
        location,
        locationName,
        status: 'Reported',
        userId: user?.uid,
        reporterName: user?.displayName,
        createdAt: serverTimestamp(),
        upvotes: 0,
        verifications: 0,
      });

      toast.success('Issue reported successfully!');
      navigate('/app');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit report.');
    } finally {
      setIsSubmitting(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Report an Issue</h1>
        <p className="text-slate-500 font-medium tracking-tight mt-1">Upload a photo and let AI help categorize the infrastructure problem.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
        <div className="space-y-6">
          <Card className="rounded-xl shadow-sm border border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-800">Evidence</CardTitle>
              <CardDescription className="text-slate-500">Upload a clear photo of the issue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div 
                className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-[200px] object-contain rounded-md shadow-sm" />
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm font-semibold text-slate-700">Click to upload</span>
                    <span className="text-xs text-slate-500 mt-1 font-medium">Image or short video</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Additional Context (Optional)</Label>
                <Textarea 
                  className="bg-white border-slate-200 focus-visible:ring-blue-500 resize-none"
                  placeholder="Tell us what happened..." 
                  value={userDescription}
                  onChange={(e) => setUserDescription(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>

              <Button 
                className={`w-full font-semibold shadow-sm h-11 ${isAnalyzing ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`} 
                variant="secondary"
                disabled={!file || isAnalyzing} 
                onClick={handleAnalyze}
              >
                {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Abstracting...</> : 'Analyze with Gemini AI'}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border border-slate-200">
            <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-slate-800">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Button variant="outline" className="w-full bg-white font-semibold text-slate-700 h-10 border-slate-300 hover:bg-slate-50" onClick={captureLocation} type="button">
                <MapPin className="mr-2 h-4 w-4 text-emerald-500" />
                {location ? 'Update Location' : 'Auto-Capture Location'}
              </Button>
              {locationName && (
                <div className="text-xs font-semibold text-center p-2 bg-emerald-50 text-emerald-700 rounded-md tracking-tight border border-emerald-100">
                  {locationName}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <Card className="rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                Issue Details
                {title && <span className="flex items-center text-[10px] uppercase font-bold tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded shadow-sm border border-blue-200"><Info className="w-3 h-3 mr-1" /> AI Generated</span>}
              </CardTitle>
              <CardDescription className="text-slate-500">Review and edit the generated details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700 font-semibold">Title <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  className="font-medium bg-white border-slate-200 focus-visible:ring-blue-500"
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Large pothole on Main St." 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-700 font-semibold">Category <span className="text-red-500">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="bg-white border-slate-200 font-medium">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Road Damage">Road Damage</SelectItem>
                      <SelectItem value="Pothole">Pothole</SelectItem>
                      <SelectItem value="Water Leakage">Water Leakage</SelectItem>
                      <SelectItem value="Garbage">Garbage</SelectItem>
                      <SelectItem value="Street Light">Street Light</SelectItem>
                      <SelectItem value="Drainage">Drainage</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept" className="text-slate-700 font-semibold">Suggested Department</Label>
                  <Input 
                    id="dept" 
                    className="font-medium bg-white border-slate-200"
                    value={department} 
                    onChange={e => setDepartment(e.target.value)} 
                    placeholder="e.g. DOT" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severity" className="text-slate-700 font-semibold">Severity</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger id="severity" className="bg-white border-slate-200 font-medium">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risk" className="text-slate-700 font-semibold">Risk Score (1-10)</Label>
                  <Input 
                    id="risk" 
                    type="number" 
                    className="bg-white border-slate-200 font-medium"
                    min={1} max={10} 
                    value={risk} 
                    onChange={e => setRisk(e.target.value)} 
                    placeholder="Auto-calculated" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc" className="text-slate-700 font-semibold">Full Description <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="desc" 
                  className="min-h-[120px] bg-white border-slate-200 resize-none font-medium leading-relaxed"
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Detailed explanation of the issue and location context..." 
                  required 
                />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t border-slate-100 pt-5 pb-5">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-white h-11 shadow-sm" disabled={isSubmitting || !title || !file}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {loadingStatus || 'Submitting...'}</> : 'Submit Civic Report'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
