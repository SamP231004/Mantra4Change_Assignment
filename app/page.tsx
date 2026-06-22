"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { REPORTING_MONTHS } from "./lib/months";

type Filters = {
  month: string;
  district: string;
};

type Metrics = {
  totalSchools: number;
  participatingSchools: number;
  participationPercentage: number;
  evidencePercentage: number;
  riskStatus: string;
  attendancePercentage: number;
  totalAttendance: number;
  attendanceCapacity: number;
  totalEnrollment: number;
};

type RiskBreakdown = {
  "On Track": number;
  Behind: number;
  "At Risk": number;
  Critical: number;
};

type Movement = {
  previousMonth: string;
  participationPercentage: number;
  evidencePercentage: number;
  attendancePercentage: number;
} | null;

type DistrictPerformance = {
  district: string;
  metrics: Metrics;
  riskBreakdown: RiskBreakdown;
};

type DashboardData = {
  metrics: Metrics;
  movement: Movement;
  riskBreakdown: RiskBreakdown;
  districtPerformance: DistrictPerformance[];
  availableDistricts: string[];
};

type DashboardResponse =
  | { success: true; data: DashboardData }
  | { success: false; error?: string };

export default function App() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<Filters>({
    month: "2025-07",
    district: "All",
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);

      try {
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`/api/dashboard?${queryParams.toString()}`);
        const result = (await response.json()) as DashboardResponse;

        if (result.success) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [filters]);

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getRiskColor = (status: string) => {
    switch (status) {
      case "On Track":
        return "bg-green-100 text-green-800 border-green-200";
      case "Behind":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "At Risk":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getMovementLabel = (value: number) => {
    if (value > 0) return `+${value}% MoM`;
    if (value < 0) return `${value}% MoM`;
    return "0% MoM";
  };

  const getMovementColor = (value: number) => {
    if (value > 0) return "text-green-700 bg-green-50 border-green-200";
    if (value < 0) return "text-red-700 bg-red-50 border-red-200";
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  const riskLevels = ["On Track", "Behind", "At Risk", "Critical"] as const;

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Program Intelligence
            </h1>
            <p className="mt-1 text-slate-500">
              Monthly Review & Decision Support
            </p>
          </div>
          <Link
            href="/reporting"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Generate Grant Report
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Reporting Month
            </label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="min-w-[150px] rounded-md border border-slate-300 bg-slate-50 p-2"
            >
              <option value="All">All Months</option>
              {REPORTING_MONTHS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-500">
              District
            </label>
            <select
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
              className="min-w-[150px] rounded-md border border-slate-300 bg-slate-50 p-2"
            >
              <option value="All">All Districts</option>
              {dashboardData?.availableDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        )}

        {!loading && dashboardData && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-1 text-sm font-medium text-slate-500">
                  Total Schools
                </p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {dashboardData.metrics.totalSchools.toLocaleString()}
                </h3>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-1 text-sm font-medium text-slate-500">
                  PBL Participation Rate
                </p>
                <div className="flex flex-wrap items-end gap-2">
                  <h3 className="text-3xl font-bold text-slate-900">
                    {dashboardData.metrics.participationPercentage}%
                  </h3>
                  {dashboardData.movement && (
                    <span
                      className={`mb-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getMovementColor(
                        dashboardData.movement.participationPercentage,
                      )}`}
                    >
                      {getMovementLabel(
                        dashboardData.movement.participationPercentage,
                      )}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {dashboardData.metrics.participatingSchools} schools active
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-1 text-sm font-medium text-slate-500">
                  Evidence Submission
                </p>
                <div className="flex flex-wrap items-end gap-2">
                  <h3 className="text-3xl font-bold text-slate-900">
                    {dashboardData.metrics.evidencePercentage}%
                  </h3>
                  {dashboardData.movement && (
                    <span
                      className={`mb-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getMovementColor(
                        dashboardData.movement.evidencePercentage,
                      )}`}
                    >
                      {getMovementLabel(dashboardData.movement.evidencePercentage)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  of participating schools
                </p>
              </div>

              <div
                className={`rounded-xl border p-5 shadow-sm ${getRiskColor(
                  dashboardData.metrics.riskStatus,
                )}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="mb-1 text-sm font-medium">Attendance Health</p>
                  <span className="rounded-md bg-white/50 px-2 py-1 text-xs font-bold uppercase tracking-wider">
                    {dashboardData.metrics.riskStatus}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-end gap-2">
                  <h3 className="text-3xl font-bold">
                    {dashboardData.metrics.attendancePercentage}%
                  </h3>
                  {dashboardData.movement && (
                    <span
                      className={`mb-1 rounded-full border bg-white/70 px-2 py-0.5 text-xs font-semibold ${getMovementColor(
                        dashboardData.movement.attendancePercentage,
                      )}`}
                    >
                      {getMovementLabel(
                        dashboardData.movement.attendancePercentage,
                      )}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs opacity-80">
                  {dashboardData.metrics.totalAttendance.toLocaleString()} /{" "}
                  {dashboardData.metrics.attendanceCapacity.toLocaleString()} session attendance
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-800">
                  School Risk Mix
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Count of schools in each risk band for the selected filters
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {riskLevels.map((riskLevel) => (
                  <div
                    key={riskLevel}
                    className={`rounded-lg border p-3 ${getRiskColor(riskLevel)}`}
                  >
                    <p className="text-xs font-semibold uppercase">
                      {riskLevel}
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {dashboardData.riskBreakdown[riskLevel].toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h3 className="font-semibold text-slate-800">
                  District Performance Breakdown
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Identify high-performing and at-risk geographies
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-semibold">District Name</th>
                      <th className="px-6 py-3 font-semibold">Schools</th>
                      <th className="px-6 py-3 font-semibold">Participation</th>
                      <th className="px-6 py-3 font-semibold">Evidence Rate</th>
                      <th className="px-6 py-3 font-semibold">Attendance</th>
                      <th className="px-6 py-3 font-semibold">School Risk Mix</th>
                      <th className="px-6 py-3 font-semibold">Risk Engine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.districtPerformance.map((geo) => (
                      <tr
                        key={geo.district}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {geo.district}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {geo.metrics.totalSchools}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-slate-200">
                              <div
                                className="h-1.5 rounded-full bg-blue-500"
                                style={{
                                  width: `${geo.metrics.participationPercentage}%`,
                                }}
                              />
                            </div>
                            <span className="text-slate-600">
                              {geo.metrics.participationPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {geo.metrics.evidencePercentage}%
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {geo.metrics.attendancePercentage}%
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 text-xs">
                            {riskLevels.map((riskLevel) => (
                              <span
                                key={riskLevel}
                                className={`rounded-full border px-2 py-0.5 font-semibold ${getRiskColor(
                                  riskLevel,
                                )}`}
                              >
                                {riskLevel}: {geo.riskBreakdown[riskLevel]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getRiskColor(
                              geo.metrics.riskStatus,
                            )}`}
                          >
                            {geo.metrics.riskStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {dashboardData.districtPerformance.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-slate-500"
                        >
                          No geographical data found for these filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
