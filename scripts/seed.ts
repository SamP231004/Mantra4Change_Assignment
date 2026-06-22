import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import pg from 'pg';
import { normalizeReportingMonth } from '../app/lib/months';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type CsvRow = Record<string, string | undefined>;

async function processFile(filePath: string, defaultMonth: string) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const { data } = Papa.parse<CsvRow>(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
    });

    console.log(`\n======================================`);
    console.log(`Processing ${data.length} records from ${path.basename(filePath)}...`);

    const CODE_KEY = "what_is_your_school's_synthetic_school_code?";
    const DISTRICT_KEY = "what_is_the_name_of_your_district?";
    const BLOCK_KEY = "block_details";
    const PARTICIPATING_KEY = "was_the_pbl_project_conducted_in_your_school_this_month?";
    const EVIDENCE_KEY = "was_evidence_submitted_for_the_completed_pbl_project?";
    const GRADE_KEY = "in_which_class/classes_did_you_conduct_the_pbl_project?";
    const SUBJECT_KEY = "which_subject_do_you_teach?";
    const ENROLLMENT_KEY = "derived:_total_enrollment_across_classes_6-8";
    const ATTENDANCE_KEY = "derived:_total_attendance_across_pbl_science_and_math_sessions";
    const MONTH_KEY = "reporting_month";

    if (data.length > 0 && !data[0][CODE_KEY]) {
        console.error("Key verification failed. Available keys:", Object.keys(data[0]));
        throw new Error("Target mapping columns could not be found.");
    }

    let recordCount = 0;

    for (const row of data) {
        const rawCode = row[CODE_KEY]?.toString().trim();
        if (!rawCode) continue;

        const district = row[DISTRICT_KEY]?.toString().trim() || 'Unknown District';
        const block = row[BLOCK_KEY]?.toString().trim() || 'Unknown Block';
        const monthLabel = normalizeReportingMonth(row[MONTH_KEY]) || defaultMonth;

        const isParticipating = row[PARTICIPATING_KEY]?.toLowerCase() === 'yes' || row[PARTICIPATING_KEY]?.toLowerCase() === 'true';
        const isEvidenceSubmitted = row[EVIDENCE_KEY]?.toLowerCase() === 'yes' || row[EVIDENCE_KEY]?.toLowerCase() === 'true';
        const enrollmentVal = Number.parseInt(row[ENROLLMENT_KEY] || '', 10) || 0;
        const attendanceVal = Number.parseInt(row[ATTENDANCE_KEY] || '', 10) || 0;

        const school = await prisma.school.upsert({
            where: { schoolCode: rawCode },
            update: { district, block },
            create: { schoolCode: rawCode, district, block },
        });

        await prisma.monthlyRecord.upsert({
            where: { schoolId_month: { schoolId: school.id, month: monthLabel } },
            update: {
                participating: isParticipating,
                evidenceSubmitted: isEvidenceSubmitted,
                enrollment: enrollmentVal,
                attendance: attendanceVal,
                grade: row[GRADE_KEY] || 'Multiple',
                subject: row[SUBJECT_KEY] || 'All',
            },
            create: {
                schoolId: school.id,
                month: monthLabel,
                participating: isParticipating,
                evidenceSubmitted: isEvidenceSubmitted,
                enrollment: enrollmentVal,
                attendance: attendanceVal,
                grade: row[GRADE_KEY] || 'Multiple',
                subject: row[SUBJECT_KEY] || 'All',
            },
        });

        recordCount++;

        if (recordCount % 100 === 0) {
            console.log(`Inserted ${recordCount} / ${data.length} records...`);
        }
    }
    console.log(`Successfully completed ${path.basename(filePath)}!`);
}

async function main() {
    console.log('Starting database seed...');

    await processFile(path.join(process.cwd(), 'data', 'PBL_School_Response_Data_July_2025.csv'), '2025-07');
    await processFile(path.join(process.cwd(), 'data', 'PBL_School_Response_Data_August_2025.csv'), '2025-08');
    await processFile(path.join(process.cwd(), 'data', 'PBL_School_Response_Data_September_2025.csv'), '2025-09');

    console.log('\nAll database pipeline ingestion completed.');
}

main()
    .catch((e) => {
        console.error("Migration Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
