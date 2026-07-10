// Round-trip helpers between the yyyy-mm-dd strings the backend/forms use and
// local Date objects, plus month-arithmetic shared by the date picker and the
// bucket target/deadline/monthly calculator.

export function parseDateOnly(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toDateOnlyString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateOnlyDisplay(str: string): string {
  return parseDateOnly(str).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

// Whole calendar months between two dates, at least 1 (used as a divisor).
export function monthsBetween(from: Date, to: Date): number {
  const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return Math.max(months, 1);
}
