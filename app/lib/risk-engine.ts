export type RiskLevel = 'On Track' | 'Behind' | 'At Risk' | 'Critical';

/**
 * Applies consistent code-based risk thresholds.
 * Required Thresholds: 
 * On Track >= 75%; Behind 60% to below 75%; At Risk 35% to below 60%; Critical below 35%
 */
export function calculateRiskClassification(percentage: number): RiskLevel {
    if (percentage >= 75) return 'On Track';
    if (percentage >= 60) return 'Behind';
    if (percentage >= 35) return 'At Risk';
    return 'Critical';
}

export interface KPIResult {
    totalSchools: number;
    participatingSchools: number;
    participationPercentage: number;
    evidencePercentage: number;
    totalEnrollment: number;
    totalAttendance: number;
    attendanceCapacity: number;
    attendancePercentage: number;
    riskStatus: RiskLevel;
}

export type RiskBreakdown = Record<RiskLevel, number>;

export interface MetricRecord {
    participating: boolean;
    evidenceSubmitted: boolean;
    enrollment: number;
    attendance: number;
}

const SUBJECT_SESSIONS_PER_STUDENT = 2;
const RISK_LEVELS: RiskLevel[] = ['On Track', 'Behind', 'At Risk', 'Critical'];

function roundToOneDecimal(value: number) {
    return Math.round(value * 10) / 10;
}

/**
 * Deterministic calculation of dashboard metrics
 */
export function computeMetrics(records: MetricRecord[]): KPIResult {
    const totalSchools = records.length;
    const participatingSchools = records.filter(r => r.participating).length;
    const evidenceSubmitted = records.filter(r => r.evidenceSubmitted).length;

    const totalEnrollment = records.reduce((sum, r) => sum + r.enrollment, 0);
    const totalAttendance = records.reduce((sum, r) => sum + r.attendance, 0);

    const participationPercentage = totalSchools > 0 ? (participatingSchools / totalSchools) * 100 : 0;
    const evidencePercentage = participatingSchools > 0 ? (evidenceSubmitted / participatingSchools) * 100 : 0;
    const attendanceCapacity = totalEnrollment * SUBJECT_SESSIONS_PER_STUDENT;
    const attendancePercentage = attendanceCapacity > 0 ? (totalAttendance / attendanceCapacity) * 100 : 0;
    const boundedAttendancePercentage = Math.min(attendancePercentage, 100);

    return {
        totalSchools,
        participatingSchools,
        participationPercentage: roundToOneDecimal(participationPercentage),
        evidencePercentage: roundToOneDecimal(evidencePercentage),
        totalEnrollment,
        totalAttendance,
        attendanceCapacity,
        attendancePercentage: roundToOneDecimal(boundedAttendancePercentage),
        riskStatus: calculateRiskClassification(boundedAttendancePercentage)
    };
}

export function computeRiskBreakdown(records: MetricRecord[]): RiskBreakdown {
    const breakdown = RISK_LEVELS.reduce((acc, riskLevel) => {
        acc[riskLevel] = 0;
        return acc;
    }, {} as RiskBreakdown);

    records.forEach((record) => {
        const attendanceCapacity = record.enrollment * SUBJECT_SESSIONS_PER_STUDENT;
        const attendancePercentage = attendanceCapacity > 0 ? (record.attendance / attendanceCapacity) * 100 : 0;
        const riskLevel = calculateRiskClassification(Math.min(attendancePercentage, 100));
        breakdown[riskLevel] += 1;
    });

    return breakdown;
}
