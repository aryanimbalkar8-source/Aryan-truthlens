export interface SuspiciousRegion {
  description: string;
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-100 scale
}

export interface AdvancedMetrics {
  noiseDistribution: { name: string; value: number }[]; // For frequency analysis chart
  errorLevelAnalysis: number; // 0-100 score
  colorSpaceConsistency: number; // 0-100 score
  compressionArtifacts: number; // 0-100 score
  mathematicalLogicScore: number; // 0-100 score based on geometry
  detectedGenerator?: string; // Specific guess at architecture (e.g. StyleGAN2, AdaIN)
  tensorGradientDescription: string; // Jargon-heavy description of the vector field
}

export interface AnalysisResult {
  classification: 'Real' | 'AI Generated' | 'Digitally Manipulated' | 'Unknown';
  confidenceScore: number; // 0-100
  verdictSummary: string;
  detailedAnalysis: string[];
  technicalIndicators: {
    lighting: string;
    textures: string;
    anatomy: string;
    artifacts: string;
  };
  suspiciousRegions: SuspiciousRegion[];
  detectedModelSignatures?: string[];
  advancedMetrics?: AdvancedMetrics; // Optional, only populated on advanced scan
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppState {
  IDLE = 'IDLE',
  TRAINING = 'TRAINING',
  PREVIEW = 'PREVIEW',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}