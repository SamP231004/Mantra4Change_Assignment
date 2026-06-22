import { NextResponse } from 'next/server';
import { prisma } from '../../lib/db';
import { computeMetrics } from '../../lib/risk-engine';
import { GoogleGenAI } from '@google/genai';
import { formatReportingMonth, normalizeReportingMonth } from '../../lib/months';

// Initialize Gemini
// Ensure GEMINI_API_KEY is in your .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GenerateReportRequest {
    month?: string;
    grantLabel?: string;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as GenerateReportRequest;
        const { month, grantLabel } = body;
        const normalizedMonth = normalizeReportingMonth(month);
        const reportingPeriod = formatReportingMonth(month);

        if (!month) {
            return NextResponse.json({ success: false, error: "Month is required" }, { status: 400 });
        }

        // Fetch records for the selected month to get actual facts
        const records = await prisma.monthlyRecord.findMany({
            where: normalizedMonth ? { month: normalizedMonth } : {},
            include: { school: true }
        });

        // Compute our deterministic facts using the Tier 1 Risk Engine
        const facts = computeMetrics(records);

        // Build a strict prompt that forces the LLM to only use our computed facts
        const prompt = `
      You are an expert Grant Reporting Assistant for Mantra4Change.
      Generate a concise, professional grant report section based STRICTLY on the following deterministic facts. 
      DO NOT hallucinate any locations, achievements, or numbers outside of this data.
      
      REPORTING FACTS:
      - Grant Label: ${grantLabel || 'General Program Funding'}
      - Reporting Period: ${reportingPeriod}
      - Total Schools Active: ${facts.participatingSchools} out of ${facts.totalSchools}
      - Program Participation Rate: ${facts.participationPercentage}%
      - Evidence Submission Rate: ${facts.evidencePercentage}%
      - Total Students Enrolled: ${facts.totalEnrollment}
      - Total Recorded Session Attendance: ${facts.totalAttendance} out of ${facts.attendanceCapacity} possible subject-session attendances
      - Average Attendance Rate: ${facts.attendancePercentage}%
      - Current Program Risk Level: ${facts.riskStatus}
      
      Format the output using Markdown into three short sections:
      ### 1. Executive Summary
      (A brief 2-sentence summary of participation and attendance.)
      
      ### 2. Achievements & Evidence
      (Highlight the participation and evidence submission rates.)
      
      ### 3. Risk Assessment & Gaps
      (State the deterministic Risk Level and what the attendance rate suggests for follow-up.)
    `;

        // Call the Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Safely extract the generated text
        const narrative = response.text || "Narrative generation failed.";

        // Return BOTH the deterministic facts and the generated narrative
        // This satisfies the requirement to separate facts from AI text.
        return NextResponse.json({
            success: true,
            data: {
                facts,
                narrative: narrative || "Report generation failed.",
            }
        });

    } catch (error) {
        console.error("Generation API Error:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to generate report. Make sure GEMINI_API_KEY is set in .env."
        }, { status: 500 });
    }
}
