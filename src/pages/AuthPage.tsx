import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const { signInWithGoogle, signInWithEmail, registerWithEmail, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user && !loading) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg('');
      await signInWithGoogle();
      // On success, useEffect routes to /app
    } catch (error: any) {
      console.error(error);
      let errorMessage = error.message || 'Google Auth Error';
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google sign-in is not enabled. Please enable it in your Firebase Console > Authentication > Sign-in method.';
      }
      setErrorMsg(errorMessage);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name || 'User');
      }
    } catch (error: any) {
      console.error(error);
      let errorMessage = error.message || 'Authentication Error';
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password sign-in is not enabled. Please enable it in your Firebase Console > Authentication > Sign-in method.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      setErrorMsg(errorMessage);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-sm rounded-2xl shadow-md border-slate-200">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="flex justify-center mb-4">
             <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
               <span className="font-bold text-lg tracking-tight">CM</span>
             </div>
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">
            {isLogin ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Join the community to report and verify civic issues securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleEmailAuth}>
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="citizen@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            
            {errorMsg && (
              <div className="text-sm font-medium text-red-500 text-center">
                {errorMsg}
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button variant="outline" onClick={handleGoogleLogin} className="w-full h-11 mt-6 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-600 font-semibold p-0 h-auto">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
          <p className="text-center text-xs text-slate-500 font-medium leading-relaxed">
            By authenticating, you agree to the Civic Integrity Guidelines.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
