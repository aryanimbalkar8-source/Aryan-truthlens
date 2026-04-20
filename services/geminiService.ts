import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeImage = async (base64Image: string, mimeType: string, isAdvanced: boolean = false, isCustomTrained: boolean = false): Promise<AnalysisResult> => {

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API Key is missing. You must add GEMINI_API_KEY exactly as mapped in Vercel's Environment Variables, and then redeploy/rebuild your Vercel project.");
  }

  let systemInstruction = "";
  let promptText = "";

  if (isAdvanced) {
    // The "Super Architecture" Simulation
    const modelVersion = isCustomTrained ? "v2.0 (Fine-Tuned Custom Weights)" : "v1.0 (Base)";
    const trainingContext = isCustomTrained 
      ? "You have recently undergone rigorous fine-tuning on a specialized user-provided dataset of high-difficulty deepfakes. Your sensitivity to 'Diffusion Noise' and 'GAN Artifacts' is maximized." 
      : "You have been trained on a private dataset of 1,000,000 GAN, Diffusion, and 'Banana Nano' images.";

    systemInstruction = `
      You are 'Neuro-Spectral ResNet-X' ${modelVersion}, a proprietary AI forensics model built on a custom PyTorch architecture.
      ${trainingContext}
      Your architecture utilizes 'Chrominance-Flux Variance' and 'Tensor-Flow Continuity' scoring, a method not published in any IEEE paper.
      
      Perform a deep mathematical breakdown of the image. 
      Analyze the high-frequency noise components, Error Level Analysis (ELA), and pixel-grid alignment.
      Be extremely technical and critical.
    `;
    
    promptText = `
      Analyze this image using your custom architecture (${modelVersion}). 
      Detect deepfake signatures from models like GPT-5 Visualizer, Google Banana Nano, Midjourney v6, and Flux.
      
      Calculate the following specific mathematical metrics (0-100 scale):
      1. Error Level Analysis (ELA) score.
      2. Color Space Consistency.
      3. Compression Artifact Coherence.
      4. Mathematical Logic Score (geometry/perspective).
      
      Provide a noise distribution dataset for a graph (Low Freq, Mid Freq, High Freq anomalies).
      
      Identify specific generator architectures if possible (e.g., "Latent Diffusion U-Net", "Transformer-based GAN").
    `;
  } else {
    // Standard Analysis
    systemInstruction = `You are an expert digital forensics investigator.`;
    promptText = `
      Analyze the provided image for signs that it is Deepfake, AI-Generated, or Photoshop manipulated.
      Look for: Inconsistent lighting, unnatural textures, anatomical errors, and text artifacts.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: promptText }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: {
              type: Type.STRING,
              enum: ['Real', 'AI Generated', 'Digitally Manipulated', 'Unknown'],
              description: "The final verdict."
            },
            confidenceScore: { type: Type.NUMBER },
            verdictSummary: { type: Type.STRING },
            detailedAnalysis: { type: Type.ARRAY, items: { type: Type.STRING } },
            technicalIndicators: {
              type: Type.OBJECT,
              properties: {
                lighting: { type: Type.STRING },
                textures: { type: Type.STRING },
                anatomy: { type: Type.STRING },
                artifacts: { type: Type.STRING }
              }
            },
            suspiciousRegions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  box_2d: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                }
              }
            },
            detectedModelSignatures: { type: Type.ARRAY, items: { type: Type.STRING } },
            // Advanced Fields (Optional in schema, but requested in prompt if advanced)
            advancedMetrics: {
              type: Type.OBJECT,
              properties: {
                noiseDistribution: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.NUMBER }
                    }
                  }
                },
                errorLevelAnalysis: { type: Type.NUMBER },
                colorSpaceConsistency: { type: Type.NUMBER },
                compressionArtifacts: { type: Type.NUMBER },
                mathematicalLogicScore: { type: Type.NUMBER },
                detectedGenerator: { type: Type.STRING },
                tensorGradientDescription: { type: Type.STRING }
              }
            }
          },
          required: ["classification", "confidenceScore", "verdictSummary", "detailedAnalysis", "technicalIndicators"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    return JSON.parse(resultText) as AnalysisResult;

  } catch (error: any) {
    console.error("Analysis Failed", error);
    throw new Error(error.message || "Failed to analyze image. Please try again.");
  }
};

export const createForensicChat = (base64Image: string, mimeType: string, result: AnalysisResult): Chat => {
  const systemInstruction = `
    You are 'Neuro-Spectral ResNet-X', the proprietary AI model that just analyzed the user's image.
    
    Here is your previous analysis findings:
    Verdict: ${result.classification} (${result.confidenceScore}% confidence)
    Summary: ${result.verdictSummary}
    Signatures: ${result.detectedModelSignatures?.join(', ')}
    
    The user will ask you questions about the image or your analysis.
    Answer as the model itself. Be technical, use forensic jargon (ELA, Noise Pattern, Tensor Gradients), but be helpful.
    Refuse to answer non-forensic questions.
  `;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
    history: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: "This is the image you analyzed. I am ready to ask questions." }
        ]
      },
      {
        role: 'model',
        parts: [
          { text: "Affirmative. Image loaded into tensor memory. Analysis context established. Awaiting query." }
        ]
      }
    ]
  });

  return chat;
};
