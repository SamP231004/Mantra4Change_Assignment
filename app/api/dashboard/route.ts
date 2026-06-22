import { NextResponse } from 'next/server';
import { prisma } from '../../lib/db'; 
import { computeMetrics, computeRiskBreakdown } from '../../lib/risk-engine';
import { getPreviousReportingMonth, normalizeReportingMonth } from '../../lib/months';
import type { Prisma, School, MonthlyRecord } from '@prisma/client';

type DashboardRecord = MonthlyRecord & { school: School };

function roundDelta(value: number) {
  return Math.round(value * 10) / 10;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const month = normalizeReportingMonth(searchParams.get('month'));
  const district = searchParams.get('district');

  try {
    const whereClause: Prisma.MonthlyRecordWhereInput = {};
    
    if (month) {
      whereClause.month = month;
    }
    
    if (district && district !== 'All') {
      whereClause.school = { district: district };
    }
    
    const previousMonth = getPreviousReportingMonth(month);
    const previousWhereClause: Prisma.MonthlyRecordWhereInput | undefined = previousMonth
      ? {
          ...whereClause,
          month: previousMonth,
        }
      : undefined;

    const records = await prisma.monthlyRecord.findMany({
      where: whereClause,
      include: { school: true },
    });

    const previousRecords = previousWhereClause
      ? await prisma.monthlyRecord.findMany({
          where: previousWhereClause,
          include: { school: true },
        })
      : [];

    const allSchools = await prisma.school.findMany({
      select: { district: true },
      distinct: ['district']
    });
    const availableDistricts = allSchools.map(s => s.district).filter(Boolean).sort();

    const metrics = computeMetrics(records);
    const previousMetrics = previousRecords.length > 0 ? computeMetrics(previousRecords) : null;
    const movement = previousMetrics
      ? {
          previousMonth,
          participationPercentage: roundDelta(metrics.participationPercentage - previousMetrics.participationPercentage),
          evidencePercentage: roundDelta(metrics.evidencePercentage - previousMetrics.evidencePercentage),
          attendancePercentage: roundDelta(metrics.attendancePercentage - previousMetrics.attendancePercentage),
        }
      : null;
    const riskBreakdown = computeRiskBreakdown(records);

    const districtGroups = records.reduce((acc: Record<string, DashboardRecord[]>, record) => {
      const d = record.school?.district || 'Unknown District';
      if (!acc[d]) acc[d] = [];
      acc[d].push(record);
      return acc;
    }, {});

    const districtPerformance = Object.keys(districtGroups).map(d => ({
      district: d,
      metrics: computeMetrics(districtGroups[d]),
      riskBreakdown: computeRiskBreakdown(districtGroups[d])
    })).sort((a, b) => b.metrics.attendancePercentage - a.metrics.attendancePercentage);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        movement,
        riskBreakdown,
        districtPerformance,
        availableDistricts
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
