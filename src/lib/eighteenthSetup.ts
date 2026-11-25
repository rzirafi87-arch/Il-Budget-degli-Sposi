export function parseEighteenthSetup(body: { name?: unknown; date?: unknown; budget?: unknown }) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const date = typeof body.date === "string" ? body.date : "";
  const parsed = new Date(date + "T00:00:00Z");
  if (!name || name.length > 120 || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date ||
      typeof body.budget !== "number" || !Number.isFinite(body.budget) || body.budget < 0) return null;
  return { name, event_date: date, total_budget: body.budget };
}
