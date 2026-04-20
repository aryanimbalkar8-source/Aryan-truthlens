import React from 'react';

interface ScannerProps {
  active: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-10">
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Moving Scan Line */}
      <div className="scan-line"></div>
      
      {/* Corner Brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500"></div>
      
      {/* Status Text */}
      <div className="absolute bottom-6 right-6 font-mono text-cyan-400 text-sm animate-pulse">
        SCANNING_LAYERS...
      </div>
    </div>
  );
};

export default Scanner;
