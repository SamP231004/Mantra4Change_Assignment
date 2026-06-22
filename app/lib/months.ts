export const REPORTING_MONTHS = [
  { value: "2025-07", label: "July 2025" },
  { value: "2025-08", label: "August 2025" },
  { value: "2025-09", label: "September 2025" },
] as const;

const MONTH_ALIASES = new Map<string, string>(
  REPORTING_MONTHS.flatMap(({ value, label }) => [
    [value.toLowerCase(), value],
    [label.toLowerCase(), value],
    [label.split(" ")[0].toLowerCase(), value],
  ]),
);

export function normalizeReportingMonth(month: string | null | undefined) {
  if (!month || month === "All") return undefined;

  const normalized = MONTH_ALIASES.get(month.trim().toLowerCase());
  return normalized ?? month.trim();
}

export function formatReportingMonth(month: string | null | undefined) {
  if (!month || month === "All") return "All Months";

  const normalized = normalizeReportingMonth(month);
  return (
    REPORTING_MONTHS.find((reportingMonth) => reportingMonth.value === normalized)
      ?.label ?? month
  );
}

export function getPreviousReportingMonth(month: string | null | undefined) {
  const normalized = normalizeReportingMonth(month);
  if (!normalized) return undefined;

  const index = REPORTING_MONTHS.findIndex(
    (reportingMonth) => reportingMonth.value === normalized,
  );

  return index > 0 ? REPORTING_MONTHS[index - 1].value : undefined;
}
