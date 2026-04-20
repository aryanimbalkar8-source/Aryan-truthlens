import React, { useState, useRef, useEffect } from 'react';
import { AppState, AnalysisResult, SuspiciousRegion } from './types';
import { analyzeImage, createForensicChat } from './services/geminiService';
import Scanner from './components/Scanner';
import ResultDashboard from './components/ResultDashboard';
import TrainingView from './components/TrainingView';
import ForensicChat from './components/ForensicChat';
import { Chat } from '@google/genai';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [isModelTrained, setIsModelTrained] = useState<boolean>(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Support all known images by checking mime type OR known extensions
    const isImageBase = file.type.startsWith('image/');
    const hasValidExt = file.name.match(/\.(heic|heif|webp|tiff|jpeg|jpg|png)$/i);
    if (!isImageBase && !hasValidExt) {
      setErrorMsg('Please upload a valid image file. All standard image formats are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);
      
      let finalMimeType = file.type;
      if (!finalMimeType || finalMimeType.trim() === '') {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'png') finalMimeType = 'image/png';
        else if (ext === 'webp') finalMimeType = 'image/webp';
        else if (ext === 'heic') finalMimeType = 'image/heic';
        else if (ext === 'heif') finalMimeType = 'image/heif';
        else finalMimeType = 'image/jpeg';
      }
      
      setMimeType(finalMimeType);
      setAppState(AppState.PREVIEW);
      setErrorMsg('');
      setAnalysisResult(null);
      setChatSession(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const startTraining = () => {
    setAppState(AppState.TRAINING);
  };

  const onTrainingComplete = () => {
    setIsModelTrained(true);
    if (imageSrc) {
      setAppState(AppState.PREVIEW);
    } else {
      setAppState(AppState.IDLE);
    }
  };

  const triggerAnalysis = async (isAdvanced: boolean) => {
    if (!imageSrc) return;

    setAppState(AppState.ANALYZING);
    try {
      const base64Data = imageSrc.split(',')[1];
      
      // Step 1: Analyze
      const result = await analyzeImage(base64Data, mimeType, isAdvanced, isModelTrained);
      setAnalysisResult(result);
      
      // Step 2: Initialize Chat with Context
      const chat = createForensicChat(base64Data, mimeType, result);
      setChatSession(chat);

      setAppState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Analysis failed');
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setImageSrc(null);
    setAnalysisResult(null);
    setChatSession(null);
    setErrorMsg('');
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
  };

  const renderOverlays = () => {
    if (appState !== AppState.RESULT || !analysisResult?.suspiciousRegions || !imageDimensions) return null;

    return analysisResult.suspiciousRegions.map((region, idx) => {
      if (!region.box_2d || region.box_2d.length !== 4) return null;
      
      let [ymin, xmin, ymax, xmax] = region.box_2d;
      
      // Safeguard: if values are <= 1, they are likely fractional 0-1 scale. Normalize to 0-100 scale.
      if (ymax <= 1 && xmax <= 1) {
         ymin *= 100;
         xmin *= 100;
         ymax *= 100;
         xmax *= 100;
      }
      
      const style = {
        top: `${ymin}%`,
        left: `${xmin}%`,
        height: `${ymax - ymin}%`,
        width: `${xmax - xmin}%`,
      };

      return (
        <div key={idx} className="absolute border-2 border-red-500 bg-red-500/20 group z-20" style={style}>
           <div className="absolute -top-7 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
             {region.description}
           </div>
        </div>
      );
    });
  };

  // Feature Card Component for Landing Page
  const FeatureCard = ({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) => (
    <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl hover:bg-gray-800/40 transition-colors group">
      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[linear-gradient(rgba(17,24,39,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.3)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-50"></div>
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none"></div>

      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={reset}>
            <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-900/20 overflow-hidden relative">
              <svg className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M14.31 8l-5.74 9.94M9.69 8l5.74 9.94M7.38 12h9.24M8.61 7.33l4.62 8M15.39 7.33l-4.62 8M4.84 10.82l9.24 3.73M9.92 19.16l9.24-3.73" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl tracking-tight">TruthLens</span>
          </div>
          <div className="flex items-center gap-4">
             {isModelTrained && (
               <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-800 rounded-full animate-in fade-in duration-500">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 <span className="text-xs font-mono text-green-400">MODEL V2.0 ACTIVE</span>
               </div>
             )}
             {!isModelTrained && appState !== AppState.TRAINING && (
               <button onClick={startTraining} className="text-xs font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-800 hover:border-cyan-600 px-3 py-1.5 rounded transition-all">
                 TRAIN MODEL
               </button>
             )}
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center relative z-10 w-full">
        
        {/* LANDING PAGE (IDLE STATE) */}
        {appState === AppState.IDLE && (
           <div className="w-full max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
              
              {/* Hero Section */}
              <div className="text-center max-w-4xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/20 border border-cyan-800 text-cyan-400 text-xs font-mono mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  V2.0 NEURO-SPECTRAL ENGINE LIVE
                </div>
                <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-sm">
                  Reveal the Truth <br/> Behind the Pixels.
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  The enterprise-grade forensic tool for detecting deepfakes, diffusion artifacts, and generative AI manipulation.
                </p>
              </div>

              {/* Main Upload Card */}
              <div 
                  className="w-full max-w-3xl bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-1 relative overflow-hidden group cursor-pointer shadow-2xl shadow-cyan-900/10 transition-all hover:border-cyan-500/30 hover:shadow-cyan-900/20"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="bg-gray-950/80 rounded-[22px] p-12 flex flex-col items-center justify-center border border-gray-800/50 h-80 relative z-10">
                    <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-800 group-hover:border-cyan-500/50">
                      <svg className="w-10 h-10 text-gray-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Upload Analysis Subject</h3>
                    <p className="text-gray-500 mb-8 text-center">Drag & drop or click to upload<br/><span className="text-xs opacity-60">Supports JPG, PNG, WEBP up to 20MB</span></p>
                    <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2">
                      Select Image
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-6xl">
                <FeatureCard 
                  title="Noise Distribution" 
                  desc="Analyzes pixel-level noise patterns to detect diffusion model signatures invisible to the human eye."
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                />
                <FeatureCard 
                  title="Error Level Analysis" 
                  desc="Identifies compression artifacts and inconsistencies that suggest Photoshop manipulation or in-painting."
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
                />
                <FeatureCard 
                  title="Forensic Chat Agent" 
                  desc="Interrogate the ResNet-X model directly to understand specific findings and methodology."
                  icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                />
              </div>

           </div>
        )}

        {errorMsg && (
          <div className="w-full max-w-xl bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg mt-6 flex items-center gap-3 animate-in slide-in-from-top-4">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {errorMsg}
          </div>
        )}

        {appState === AppState.TRAINING && (
          <div className="w-full py-12 px-4">
            <TrainingView onComplete={onTrainingComplete} />
          </div>
        )}

        {/* WORKSPACE & RESULTS VIEW (Non-Landing Page State) */}
        {appState !== AppState.IDLE && appState !== AppState.TRAINING && (
          <div className={`w-full max-w-7xl mx-auto px-4 py-8 grid gap-8 ${appState === AppState.RESULT ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
            
            <div className={`transition-all duration-500 ${appState === AppState.RESULT ? 'lg:col-span-5' : 'max-w-2xl mx-auto w-full'}`}>
              
              {/* Image Preview Area */}
              {imageSrc && (
                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-black group">
                  <Scanner active={appState === AppState.ANALYZING} />
                  {renderOverlays()}

                  <img 
                    ref={imageRef}
                    src={imageSrc} 
                    alt="Analysis Subject" 
                    className={`w-full h-auto object-contain max-h-[70vh] ${appState === AppState.ANALYZING ? 'opacity-50 blur-sm scale-105' : 'opacity-100'} transition-all duration-1000`}
                    onLoad={onImageLoad}
                  />
                  
                  <div className="absolute top-4 right-4 flex gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={reset}
                      className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm border border-white/10 transition-colors"
                      title="Upload new image"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Controls */}
              {appState === AppState.PREVIEW && (
                <div className="space-y-3 mt-6">
                  <button 
                    onClick={() => triggerAnalysis(false)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    INITIATE ANALYSIS
                  </button>

                  <button 
                    onClick={() => triggerAnalysis(true)}
                    className={`w-full border text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group transform hover:scale-[1.02] ${
                      isModelTrained 
                        ? 'bg-gradient-to-r from-green-900 to-emerald-900 hover:from-green-800 hover:to-emerald-800 border-green-500/30 shadow-green-900/40'
                        : 'bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 border-purple-500/30 shadow-purple-900/40'
                    }`}
                  >
                    {isModelTrained ? (
                      <svg className="w-5 h-5 animate-pulse text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                      <svg className="w-5 h-5 animate-pulse text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    )}
                    
                    <span className="flex flex-col items-start leading-tight">
                      <span className="text-sm">
                        {isModelTrained ? 'CUSTOM V2.0 FORENSIC SCAN' : 'DEEP FORENSIC SCAN'}
                      </span>
                      <span className={`text-[10px] font-mono uppercase opacity-70 ${isModelTrained ? 'text-green-300' : 'text-purple-300'}`}>
                        {isModelTrained ? 'Model: ResNet-X (Fine-Tuned)' : 'Model: Neuro-Spectral ResNet-X (Beta)'}
                      </span>
                    </span>
                  </button>
                </div>
              )}

              {appState === AppState.ERROR && (
                 <button 
                 onClick={() => triggerAnalysis(false)}
                 className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
               >
                 Retry Analysis
               </button>
              )}
            </div>

            {/* Results Column */}
            {appState === AppState.RESULT && analysisResult && (
               <div className="lg:col-span-7 flex flex-col gap-6">
                 <ResultDashboard result={analysisResult} />
                 
                 {/* Chat Integration */}
                 <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <h3 className="text-gray-400 text-sm font-mono mb-3 tracking-widest uppercase flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       Forensic Analyst Link
                    </h3>
                    <ForensicChat chatSession={chatSession} />
                 </div>
               </div>
            )}

          </div>
        )}
      </main>

      <footer className="border-t border-gray-900 py-8 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} TruthLens AI Forensics. Enterprise Edition.</p>
      </footer>
    </div>
  );
};

export default App;