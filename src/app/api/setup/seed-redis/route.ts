import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!redisUrl || !redisToken) {
    return NextResponse.json({ error: "Redis環境変数が設定されていません" }, { status: 500 });
  }

  const { Redis } = await import("@upstash/redis");
  const kv = new Redis({ url: redisUrl, token: redisToken });

  const DATA_DIR = path.join(process.cwd(), "data");

  const files: { key: string; file: string }[] = [
    { key: "users", file: "users.json" },
    { key: "reports", file: "reports.json" },
    { key: "shifts", file: "shifts.json" },
    { key: "manager-reports", file: "manager-reports.json" },
    { key: "notices", file: "notices.json" },
    { key: "sales-rates", file: "sales-day-of-week-rates.json" },
    { key: "sales-targets-monthly", file: "sales-targets-monthly.json" },
    { key: "sales-daily", file: "sales-daily.json" },
    { key: "zenin-reports", file: "zenin-reports.json" },
    { key: "timeslot-reports", file: "timeslot-reports.json" },
  ];

  const results: { key: string; status: string }[] = [];

  for (const { key, file } of files) {
    try {
      const existing = await kv.get(key);
      if (existing) {
        results.push({ key, status: "already exists - skipped" });
        continue;
      }
      const filePath = path.join(DATA_DIR, file);
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);
      await kv.set(key, data);
      results.push({ key, status: `seeded (${Array.isArray(data) ? data.length : 1} items)` });
    } catch (e) {
      results.push({ key, status: `error: ${e instanceof Error ? e.message : String(e)}` });
    }
  }

  return NextResponse.json({ ok: true, results });
}
