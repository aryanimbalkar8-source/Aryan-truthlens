import React from 'react';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ResultDashboardProps {
  result: AnalysisResult;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ result }) => {
  const isFake = result.classification !== 'Real';
  const color = isFake ? '#ef4444' : '#22c55e'; // Red for fake, Green for real
  
  const normalizedConfidence = (result.confidenceScore > 0 && result.confidenceScore <= 1.0) 
    ? Math.round(result.confidenceScore * 100) 
    : Math.round(result.confidenceScore);

  const scoreData = [
    { name: 'Confidence', value: normalizedConfidence },
    { name: 'Uncertainty', value: Math.max(0, 100 - normalizedConfidence) }
  ];

  const normalizeMetric = (val: number) => (val > 0 && val <= 1.0) ? Math.round(val * 100) : Math.round(val);

  // Data for Radar Chart (if advanced metrics exist)
  const radarData = result.advancedMetrics ? [
    { subject: 'ELA', A: normalizeMetric(result.advancedMetrics.errorLevelAnalysis), fullMark: 100 },
    { subject: 'Color', A: normalizeMetric(result.advancedMetrics.colorSpaceConsistency), fullMark: 100 },
    { subject: 'Comp.', A: normalizeMetric(result.advancedMetrics.compressionArtifacts), fullMark: 100 },
    { subject: 'Logic', A: normalizeMetric(result.advancedMetrics.mathematicalLogicScore), fullMark: 100 },
  ] : [];

  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header / Verdict */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-gray-400 text-sm font-mono mb-1 tracking-widest uppercase">Detection Verdict</h2>
          <h1 className={`text-4xl md:text-5xl font-bold font-display ${isFake ? 'text-red-500' : 'text-green-500'} drop-shadow-lg`}>
            {result.classification.toUpperCase()}
          </h1>
          {result.advancedMetrics && (
            <span className="inline-block mt-2 px-3 py-1 bg-purple-900/40 border border-purple-500/30 rounded text-xs text-purple-300 font-mono">
              ⚡ NEURO-SPECTRAL RESNET-X SCAN COMPLETE
            </span>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4 bg-gray-950 p-4 rounded-lg border border-gray-800">
          <div className="h-16 w-16">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={30}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={color} />
                  <Cell fill="#374151" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{normalizedConfidence}%</div>
            <div className="text-xs text-gray-500 uppercase">Confidence Score</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8 p-4 bg-gray-950/50 rounded-lg border-l-4 border-cyan-500">
        <h3 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Executive Summary
        </h3>
        <p className="text-gray-300 leading-relaxed text-lg">{result.verdictSummary}</p>
      </div>

      {/* ADVANCED ANALYSIS SECTION - Only shows if advanced metrics are present */}
      {result.advancedMetrics && (
        <div className="mb-8 border border-purple-900/50 bg-gradient-to-br from-gray-900 to-purple-900/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-purple-500">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </div>
          
          <h3 className="text-purple-400 font-bold text-xl mb-6 flex items-center gap-2 relative z-10">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Advanced Forensic Telemetry
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Radar Chart for Metrics */}
            <div className="h-64 w-full bg-black/20 rounded-lg p-2">
              <h4 className="text-center text-xs text-gray-500 uppercase mb-2">Multi-Vector Consistency Analysis</h4>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#4b5563" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 10 }} />
                  <Radar name="Image Score" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Noise Frequency Chart */}
            <div className="h-64 w-full bg-black/20 rounded-lg p-2">
              <h4 className="text-center text-xs text-gray-500 uppercase mb-2">High-Frequency Noise Distribution</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.advancedMetrics.noiseDistribution}>
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                  <Tooltip cursor={{fill: '#374151'}} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400 text-sm">Detected Generator Architecture:</span>
              <span className="text-white font-mono text-sm">{result.advancedMetrics.detectedGenerator || "Unknown"}</span>
            </div>
            <div className="pt-2">
              <span className="text-gray-400 text-sm block mb-1">Tensor-Flow Gradient Analysis:</span>
              <p className="text-purple-300 text-xs font-mono bg-black/30 p-2 rounded border border-purple-500/20">
                {">"} {result.advancedMetrics.tensorGradientDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout for Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Technical Indicators */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Standard Indicators</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <IndicatorCard label="Lighting & Shadows" value={result.technicalIndicators.lighting} icon="sun" />
            <IndicatorCard label="Texture Analysis" value={result.technicalIndicators.textures} icon="fingerprint" />
            <IndicatorCard label="Anatomy & Logic" value={result.technicalIndicators.anatomy} icon="user" />
            <IndicatorCard label="Digital Artifacts" value={result.technicalIndicators.artifacts} icon="cpu" />
          </div>
        </div>

        {/* Detailed Analysis & Signatures */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Forensic Breakdown</h3>
          <ul className="space-y-3">
            {result.detailedAnalysis.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          {result.detectedModelSignatures && result.detectedModelSignatures.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-sm text-gray-500 uppercase tracking-widest mb-3">Detected Patterns Compatible With</h4>
              <div className="flex flex-wrap gap-2">
                {result.detectedModelSignatures.map((sig, i) => (
                  <span key={i} className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-900/50 rounded-full text-xs font-mono">
                    {sig}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const IndicatorCard = ({ label, value, icon }: { label: string, value: string, icon: string }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
    <div className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-2">
      {/* Simple Icons based on string name */}
      {icon === 'sun' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
      {icon === 'fingerprint' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.59-4.18" /></svg>}
      {icon === 'user' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
      {icon === 'cpu' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>}
      
      {label}
    </div>
    <div className="text-gray-200 text-sm">{value}</div>
  </div>
);

export default ResultDashboard;