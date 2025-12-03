import React, { useState } from 'react';
import { Button } from './components/Button';
import { generateImageBatch, requestApiKey, checkApiKey } from './services/geminiService';
import { ASPECT_RATIOS, STYLE_PRESETS } from './constants';
import { AspectRatio, ImageResult } from './types';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[1].id); // Default to aesthetic
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Ensure API key is selected before starting
    const hasKey = await checkApiKey();
    if (!hasKey) {
      await requestApiKey();
    }

    setIsGenerating(true);
    setError(null);
    setImages([]); // Clear previous for a fresh batch feel

    try {
      const style = STYLE_PRESETS.find(s => s.id === selectedStyle);
      const styleModifier = style ? style.promptModifier : '';
      
      const base64Images = await generateImageBatch(prompt, styleModifier, aspectRatio, 4);
      
      if (base64Images.length === 0) {
        throw new Error("No images were generated. Please try again.");
      }

      const newImages: ImageResult[] = base64Images.map(dataUrl => ({
        id: uuidv4(),
        dataUrl,
        prompt: prompt,
        aspectRatio,
        createdAt: Date.now()
      }));

      setImages(newImages);

    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message === "AUTH_ERROR") {
         setError("Authentication lost. Please select your API key.");
         await requestApiKey();
      } else {
         setError("Failed to generate images. The model might be busy or the prompt triggered safety filters.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (dataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `banana-canvas-${Date.now()}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    images.forEach((img, idx) => {
      // Stagger downloads slightly to prevent browser blocking
      setTimeout(() => handleDownload(img.dataUrl, idx), idx * 250);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-tr from-yellow-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="font-bold text-white text-lg">B</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">Banana Canvas Pro</h1>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 border border-slate-800 rounded-full px-3 py-1 bg-slate-900">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Gemini 3 Pro
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Prompt Section */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-indigo-600/20 transition-colors"></div>
              
              <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
                <span>Vision Prompt</span>
                <span className="text-xs text-slate-500 font-normal">Describe your idea</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic city with flying cars, neon lights, cyberpunk style..."
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all shadow-inner"
              />
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Style Preset
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {STYLE_PRESETS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left truncate ${
                        selectedStyle === style.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                      }`}
                      title={style.label}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Aspect Ratio Section */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
               <label className="block text-sm font-medium text-slate-300 mb-4">
                Canvas Ratio
              </label>
              <div className="grid grid-cols-3 gap-3">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all relative overflow-hidden group/ratio ${
                      aspectRatio === ratio.value
                        ? 'bg-slate-800 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-600'
                    }`}
                  >
                    {/* Visual representation of the ratio */}
                    <div className="relative mb-2 flex items-center justify-center w-full h-8">
                      <div 
                        className={`border-2 rounded-sm transition-all duration-300 ${aspectRatio === ratio.value ? 'border-indigo-400 bg-indigo-400/20' : 'border-slate-600 group-hover/ratio:border-slate-400'}`}
                        style={{
                          aspectRatio: ratio.value.replace(':', '/'),
                          height: ratio.value === '16:9' ? '14px' : ratio.value === '9:16' ? '28px' : '20px'
                        }}
                      />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">{ratio.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800/50 text-center">
                <p className="text-xs text-indigo-300 font-medium">
                  {ASPECT_RATIOS.find(r => r.value === aspectRatio)?.description}
                </p>
              </div>
            </div>

            {/* Sticky Action */}
            <div className="sticky bottom-8 z-40">
              <Button 
                onClick={handleGenerate} 
                disabled={!prompt || isGenerating}
                className="w-full h-14 text-lg shadow-2xl shadow-indigo-500/20 relative overflow-hidden group"
                variant="primary"
                isLoading={isGenerating}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
                <span className="relative flex items-center gap-2">
                  {isGenerating ? 'Designing...' : (
                    <>
                      <span>Generate 4 Variations</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
                    </>
                  )}
                </span>
              </Button>
            </div>
          </div>

          {/* Right Area - Results */}
          <div className="lg:col-span-8 flex flex-col h-full">
             {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                {error}
              </div>
            )}

            {images.length === 0 && !isGenerating ? (
               // Empty State
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 min-h-[500px] p-8">
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-slate-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Social Media Canvas</h3>
                <p className="text-sm text-slate-500 max-w-sm text-center">
                  Create consistent content. We'll generate 4 high-quality variations based on your prompt and chosen aesthetic.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-700">
                {/* Toolbar if images exist */}
                {!isGenerating && images.length > 0 && (
                   <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <div className="text-sm text-slate-400">
                        Generated <span className="text-white font-bold">{images.length}</span> variations
                      </div>
                      <Button variant="secondary" size="sm" onClick={handleDownloadAll} className="gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        Download All
                      </Button>
                   </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  {/* Loading Skeletons */}
                  {isGenerating && images.length === 0 && Array.from({length: 4}).map((_, i) => (
                      <div key={i} className="aspect-[4/5] rounded-2xl bg-slate-800 border border-slate-700 relative overflow-hidden flex flex-col items-center justify-center p-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_1.5s_infinite]"></div>
                          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                          <div className="text-slate-400 text-xs font-medium animate-pulse">Rendering Variant {i+1}</div>
                      </div>
                  ))}

                  {/* Results */}
                  {images.map((img, idx) => (
                    <div key={img.id} className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl transition-all hover:border-indigo-500/50 hover:shadow-indigo-500/20">
                      <img 
                        src={img.dataUrl} 
                        alt={img.prompt} 
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 space-y-3">
                          <Button 
                            size="sm" 
                            variant="primary" 
                            className="w-full shadow-lg shadow-black/50"
                            onClick={() => handleDownload(img.dataUrl, idx)}
                          >
                            Download High Res
                          </Button>
                        </div>
                      </div>
                      
                      {/* Badge */}
                      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full opacity-75">
                         {img.aspectRatio}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;