export function csvEscape(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(rows: Array<Array<unknown>>): string {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}
