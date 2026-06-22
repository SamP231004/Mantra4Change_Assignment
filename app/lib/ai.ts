import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface FactSummary {
    geography: string;
    month: string;
    participationRate: number;
    attendanceRate: number;
    riskLevel: string;
    grantUtilization?: number;
}

export async function generateReportNarrative(facts: FactSummary): Promise<string> {
    const prompt = `
    You are an expert Grant Reporting Assistant for Mantra4Change.
    Generate a concise, professional report section based strictly on the following deterministic facts. 
    DO NOT hallucinate any locations, achievements, or numbers outside of this data.
    
    Facts:
    - Location: ${facts.geography}
    - Month: ${facts.month}
    - Participation Rate: ${facts.participationRate}%
    - Attendance Rate: ${facts.attendanceRate}%
    - Current Risk Level: ${facts.riskLevel}
    ${facts.grantUtilization ? `- Grant Utilization: ${facts.grantUtilization}%` : ''}
    
    Format the output into two short paragraphs:
    1. A summary of achievements and utilization.
    2. An outline of identified gaps or risk areas needing follow-up.
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Narrative generation failed.";
        
    } catch (error) {
        console.error("AI Generation Error:", error);
        // Graceful fallback if AI fails/is disabled
        return `[System Default] In ${facts.month}, ${facts.geography} achieved a ${facts.participationRate}% participation rate and ${facts.attendanceRate}% attendance. The current risk level is designated as ${facts.riskLevel}.`;
    }
}