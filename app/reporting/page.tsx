"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { REPORTING_MONTHS } from "../lib/months";

type ReportFacts = {
    totalSchools: number;
    participatingSchools: number;
    participationPercentage: number;
    evidencePercentage: number;
    totalEnrollment: number;
    totalAttendance: number;
    attendanceCapacity: number;
    attendancePercentage: number;
    riskStatus: string;
};

type ReportData = {
    facts: ReportFacts;
    narrative: string;
};

type GenerateReportResponse =
    | { success: true; data: ReportData }
    | { success: false; error?: string };

export default function GrantReporting() {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [error, setError] = useState("");

    const [config, setConfig] = useState({
        month: "2025-07",
        grantLabel: "PBL Expansion Grant 2025",
    });

    const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError("");
        setReportData(null);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });

            const result = (await response.json()) as GenerateReportResponse;

            if (result.success) {
                setReportData(result.data);
            } else {
                setError(result.error || "Failed to generate report.");
            }
        } catch {
            setError("A network error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Navigation & Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Grant Reporting Assistant</h1>
                        <p className="text-slate-500 mt-1">Generate deterministic reports grounded in data</p>
                    </div>
                    <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg transition">
                        Back to Dashboard
                    </Link>
                </div>

                {/* Configuration Panel */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex flex-col space-y-1 w-full md:w-1/3">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Grant Label</label>
                        <input
                            type="text"
                            name="grantLabel"
                            value={config.grantLabel}
                            onChange={handleChange}
                            className="border border-slate-300 rounded-md p-2 bg-slate-50"
                        />
                    </div>
                    <div className="flex flex-col space-y-1 w-full md:w-1/3">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Reporting Month</label>
                        <select name="month" value={config.month} onChange={handleChange} className="border border-slate-300 rounded-md p-2 bg-slate-50">
                            <option value="All">All Months</option>
                            {REPORTING_MONTHS.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition"
                    >
                        {loading ? "Generating..." : "Generate Report"}
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                {/* Results Panel */}
                {reportData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column: Deterministic Facts (Guardrail) */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-slate-100 p-5 rounded-xl border border-slate-200">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Computed Source Facts
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">These deterministic facts anchor the AI generation to prevent hallucinations.</p>

                                <ul className="space-y-3 text-sm">
                                    <li className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-600">Risk Level</span>
                                        <span className="font-bold text-slate-900">{reportData.facts.riskStatus}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-600">Participation</span>
                                        <span className="font-semibold text-slate-900">{reportData.facts.participationPercentage}%</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-600">Attendance</span>
                                        <span className="font-semibold text-slate-900">{reportData.facts.attendancePercentage}%</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-600">Evidence Rate</span>
                                        <span className="font-semibold text-slate-900">{reportData.facts.evidencePercentage}%</span>
                                    </li>
                                    <li className="flex justify-between pt-1">
                                        <span className="text-slate-600">Session Attendance</span>
                                        <span className="font-semibold text-slate-900">{reportData.facts.totalAttendance?.toLocaleString()}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Right Column: Generated Narrative */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800">Generated Report Narrative</h2>
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-medium border border-purple-200">AI Generated</span>
                            </div>

                            <div className="prose prose-slate max-w-none text-sm md:text-base">
                                {/* Render the markdown-style text safely */}
                                {reportData.narrative?.split('\n').map((line: string, i: number) => {
                                    if (line.startsWith('###')) {
                                        return <h3 key={i} className="text-lg font-bold text-slate-900 mt-6 mb-2">{line.replace('###', '').trim()}</h3>;
                                    }
                                    if (line.trim() === '') return <br key={i} />;
                                    return <p key={i} className="text-slate-700 mb-2">{line}</p>;
                                })}
                            </div>

                            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => navigator.clipboard.writeText(reportData.narrative)}
                                    className="text-slate-600 hover:text-slate-900 text-sm font-medium transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                    Copy to Clipboard
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
