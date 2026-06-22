import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, MapPin, Activity, Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 font-sans">
      <header className="px-6 lg:px-8 h-16 flex items-center border-b border-slate-200 bg-white">
        <Link to="/" className="flex items-center justify-center group">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white mr-3 shadow-sm transition-transform group-hover:scale-105">
            <span className="font-bold text-sm tracking-tight">CH</span>
          </div>
          <span className="font-bold tracking-tight text-slate-800 text-xl">CityMind AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link to="/login">
            <Button variant="ghost" className="font-semibold text-slate-600">Log in</Button>
          </Link>
          <Link to="/login">
            <Button className="font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm">Get Started</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 flex justify-center bg-white border-b border-slate-200">
          <div className="container px-4 md:px-6 text-center max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-600 mb-8 font-medium">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              GovTech Platform Live
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-slate-900 leading-[1.1]">
              Report Civic Issues. <br/><span className="text-blue-600">Powered by AI.</span>
            </h1>
            <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              A hyper-local civic issue resolution platform prioritizing immediate urban fixes through computer vision and community verification.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto font-semibold bg-blue-600 shadow-sm gap-2 h-12 px-8">
                  Report an Issue <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold h-12 px-8 bg-white text-slate-700 hover:bg-slate-50">
                  View Heatmaps
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-20 bg-slate-50 flex justify-center">
          <div className="container px-4 md:px-6 max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="flex flex-col bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 rounded-xl w-fit mb-6 border border-blue-100">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Gemini Vision Analysis</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Our AI automatically detects severity, risk levels, and routes tickets to correct municipal departments from a single photo.</p>
              </div>
              <div className="flex flex-col bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-50 rounded-xl w-fit mb-6 border border-emerald-100">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Smart Mapping</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Interactive heatmaps predict and highlight future impact hotspots in your neighborhood before they escalate.</p>
              </div>
              <div className="flex flex-col bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-orange-50 rounded-xl w-fit mb-6 border border-orange-100">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Community Governance</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Upvote, verify, and resolve issues collaboratively to earn trusted citizen points and regional badges.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex py-8 items-center justify-center px-4 md:px-6 border-t border-slate-200 bg-white">
        <p className="text-sm font-medium text-slate-500 tracking-tight">© 2026 CityMind AI. Public Sector Platform.</p>
      </footer>
    </div>
  );
}
