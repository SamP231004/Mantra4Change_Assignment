# 🌱 Mantra4Change Program Intelligence Dashboard

A full-stack **Next.js + Prisma + PostgreSQL** dashboard for reviewing school-level PBL program performance, tracking deterministic risk signals, and generating grant-ready reporting narratives grounded in source data.

The project turns monthly school response CSVs into a decision-support interface with filters, district performance tables, month-over-month movement, school risk mix, and AI-assisted grant reporting.

---

## ✨ Highlights

| Area | What It Does |
|---|---|
| 📊 Program dashboard | Shows total schools, participation, evidence submission, attendance health, and district-level performance |
| 🗓️ Month filters | Supports July, August, September 2025 and all-month views |
| 🏫 District filters | Dynamically populated from seeded school data |
| 🚦 Risk engine | Classifies performance as `On Track`, `Behind`, `At Risk`, or `Critical` using deterministic thresholds |
| 📈 MoM movement | Shows month-over-month movement for participation, evidence, and attendance |
| 🧮 School risk mix | Shows how many schools are in each risk band for the selected month and district |
| 🤖 AI report assistant | Generates grant-report narrative text while anchoring output to computed facts |
| 🗃️ CSV ingestion | Seeds normalized school and monthly record data into PostgreSQL |

---

## 📸 Screenshots

<div align="center">
  <img src="ScreenShots/SS_1.png" alt="Program Intelligence Dashboard" width="48%" style="max-height: 360px; object-fit: contain;" />
  <img src="ScreenShots/SS_2.png" alt="Grant Reporting Assistant" width="48%" style="max-height: 360px; object-fit: contain;" />
</div>

---

## 🧠 Risk Classification

The dashboard uses a deterministic risk engine so the same data always produces the same decision signal.

| Attendance Rate | Status |
|---:|---|
| `>= 75%` | 🟢 On Track |
| `60% - 74.9%` | 🟡 Behind |
| `35% - 59.9%` | 🟠 At Risk |
| `< 35%` | 🔴 Critical |

Attendance is calculated using session capacity:

```text
attendance percentage = total recorded attendance / (total enrollment * 2)
```

The `* 2` accounts for Math and Science PBL sessions in the source CSVs.

---

## 📈 Dashboard Metrics

| Metric | Source / Logic |
|---|---|
| Total Schools | Count of monthly school records matching selected filters |
| PBL Participation Rate | Participating schools divided by total schools |
| Evidence Submission | Evidence-submitted schools divided by participating schools |
| Attendance Health | Recorded session attendance divided by possible session attendance |
| MoM Movement | Current month metric minus previous month metric |
| School Risk Mix | Count of schools by risk band for current filters |

Example insight:

| Month | District | On Track Schools |
|---|---:|---:|
| 2025-09 | District J | 82 |
| 2025-09 | District G | 66 |
| 2025-09 | District AK | 61 |
| 2025-09 | District AB | 53 |
| 2025-09 | District K | 50 |
| 2025-09 | District O | 50 |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4 |
| Database | PostgreSQL |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| AI | Google GenAI SDK |
| CSV parsing | PapaParse |
| Language | TypeScript |

---

## 📁 Project Structure

```text
app/
  api/
    dashboard/route.ts       # Dashboard metrics, MoM movement, district breakdown
    generate/route.ts        # AI-assisted grant report generation
  lib/
    ai.ts                    # Gemini report helper
    db.ts                    # Prisma client
    months.ts                # Month labels, normalization, previous-month lookup
    risk-engine.ts           # KPI, risk, and risk mix calculations
  page.tsx                   # Program Intelligence dashboard
  reporting/page.tsx         # Grant Reporting Assistant

data/
  PBL_School_Response_Data_July_2025.csv
  PBL_School_Response_Data_August_2025.csv
  PBL_School_Response_Data_September_2025.csv

prisma/
  schema.prisma

scripts/
  seed.ts                    # CSV to PostgreSQL ingestion

ScreenShots/
  SS_1.png
  SS_2.png
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
GEMINI_API_KEY="your_gemini_api_key"
```

`GEMINI_API_KEY` is only required for AI report generation. The dashboard metrics work without it.

### 3. Prepare the database

```bash
npx prisma generate
```

Apply your Prisma schema using your preferred Prisma workflow, then seed the CSV data:

```bash
npx tsx scripts/seed.ts
```

The seed script uses `upsert`, so rerunning it updates existing school-month rows instead of duplicating them.

### 4. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## ✅ Validation

Use these commands before submitting or deploying:

```bash
npm run lint
npm run build
```

Both checks should pass for the current implementation.

---

## 🧭 Key Routes

| Route | Purpose |
|---|---|
| `/` | Program Intelligence dashboard |
| `/reporting` | Grant Reporting Assistant |
| `/api/dashboard` | Dashboard metrics API |
| `/api/generate` | AI report generation API |

---

## 🔌 API Snapshot

Example dashboard request:

```text
/api/dashboard?month=2025-09&district=District%20J
```

Example response shape:

```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalSchools": 205,
      "participationPercentage": 96.1,
      "evidencePercentage": 86.3,
      "attendancePercentage": 67.3,
      "riskStatus": "Behind"
    },
    "movement": {
      "previousMonth": "2025-08",
      "participationPercentage": 13.2,
      "evidencePercentage": 11,
      "attendancePercentage": 13.1
    },
    "riskBreakdown": {
      "On Track": 82,
      "Behind": 77,
      "At Risk": 36,
      "Critical": 10
    }
  }
}
```

---

## 👤 Author

**Samarth P.**

Full-Stack Software Developer with strong experience building scalable SaaS applications and enterprise-grade backend systems using Java, Spring Boot, React.js, Next.js, Node.js, MongoDB, React Native, and AWS. Proven ability to design secure payment systems, implement real-time and AI-powered features, and deliver production-grade web and mobile platforms. Proficient in REST API development, Spring Security, CI/CD pipelines, React Native & Expo mobile development, and cloud-native deployments. Active open-source contributor with multiple merged pull requests across community projects and a track record of delivering high-impact solutions in real-world environments.

| Link | URL |
|---|---|
| 🌐 Portfolio | [samp231004.github.io/Portfolio](https://samp231004.github.io/Portfolio/) |
| 💻 GitHub | [github.com/SamP231004](https://github.com/SamP231004) |
| 🔗 LinkedIn | [linkedin.com/in/samp231004](https://www.linkedin.com/in/samp231004/) |
| 📄 Resume | [View Resume](https://drive.google.com/file/d/1Ci5U-3jc_Xhmj7oOVeFsdix1uGfOCAom/view?usp=sharing) |

---