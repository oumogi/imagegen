import React, { useEffect, useState } from 'react';
import { checkApiKey, requestApiKey } from '../services/geminiService';
import { Button } from './Button';

interface ApiKeyAuthProps {
  onAuthorized: () => void;
}

export const ApiKeyAuth: React.FC<ApiKeyAuthProps> = ({ onAuthorized }) => {
  const [checking, setChecking] = useState(true);

  const verifyKey = async () => {
    setChecking(true);
    try {
      const hasKey = await checkApiKey();
      if (hasKey) {
        onAuthorized();
      }
    } catch (e) {
      console.error("Error checking key", e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    verifyKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    await requestApiKey();
    // Re-verify immediately after selection flow interaction
    verifyKey(); 
  };

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="animate-pulse text-indigo-400">Initializing Secure Environment...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-md space-y-8 rounded-2xl bg-slate-900/50 p-8 backdrop-blur-xl border border-slate-800 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Banana Canvas Pro
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Generate consistent, high-quality assets for social media using Gemini's most advanced visual models.
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="bg-amber-900/20 border border-amber-900/50 rounded-lg p-4">
             <p className="text-amber-200 text-xs flex items-start gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
               This application uses the Gemini 3 Pro model which requires a paid billing project.
             </p>
          </div>
          
          <Button onClick={handleConnect} className="w-full" size="lg">
            Connect Google Cloud Project
          </Button>

          <p className="text-center text-xs text-slate-500">
            Learn more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Gemini API Billing</a>
          </p>
        </div>
      </div>
    </div>
  );
};
