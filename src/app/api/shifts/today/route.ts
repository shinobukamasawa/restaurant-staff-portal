import { NextResponse } from "next/server";
import { readShifts } from "@/lib/data";

function cellMatchesToday(cell: string, today: Date): boolean {
  const c = String(cell).trim();
  if (!c) return false;
  const y = today.getFullYear();
  const m = (today.getMonth() + 1).toString().padStart(2, "0");
  const d = today.getDate().toString().padStart(2, "0");
  const ymd = `${y}-${m}-${d}`;
  const ymdSlash = `${y}/${m}/${d}`;
  const md = `${m}/${d}`;
  if (c === ymd || c === ymdSlash || c === md) return true;
  if (c.includes(ymd) || c.includes(ymdSlash)) return true;
  const parsed = new Date(c);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getFullYear() === y && parsed.getMonth() === today.getMonth() && parsed.getDate() === today.getDate();
  }
  const jp = c.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (jp) {
    return parseInt(jp[1], 10) === y && parseInt(jp[2], 10) === today.getMonth() + 1 && parseInt(jp[3], 10) === today.getDate();
  }
  return false;
}

function findColumnIndex(header: string[], patterns: string[]): number {
  for (let i = 0; i < header.length; i++) {
    const h = String(header[i] ?? "").toLowerCase();
    if (patterns.some((p) => h.includes(p.toLowerCase()))) return i;
  }
  return -1;
}

function parseTimeToMinutes(s: string): number {
  const t = String(s).trim();
  const m1 = t.match(/^(\d{1,2}):(\d{2})/);
  if (m1) return parseInt(m1[1], 10) * 60 + parseInt(m1[2], 10);
  const m2 = t.match(/^(\d{1,2})時(\d{1,2})?/);
  if (m2) return parseInt(m2[1], 10) * 60 + (parseInt(m2[2], 10) || 0);
  const m3 = t.match(/^(\d{1,4})$/);
  if (m3) {
    const n = parseInt(m3[1], 10);
    if (n < 100) return n * 60;
    return Math.floor(n / 100) * 60 + (n % 100);
  }
  return 9999;
}

export type TodaysShiftRow = {
  startTime: string;
  endTime: string;
  displayName: string;
};

export async function GET() {
  try {
    const imports = await readShifts();
    const latest = imports[imports.length - 1] ?? null;
    if (!latest || latest.rows.length === 0) {
      return NextResponse.json({ rows: [], source: null });
    }

    const today = new Date();
    const allRows = latest.rows;
    const header = allRows[0] ?? [];
    const dataRows = allRows.slice(1);

    const todayRows = dataRows.filter((row) => row.some((cell) => cellMatchesToday(cell, today)));

    const idxStart = findColumnIndex(header, ["開始", "start", "出勤", "勤務開始"]);
    const idxEnd = findColumnIndex(header, ["終了", "end", "退勤", "勤務終了"]);
    const idxName = findColumnIndex(header, ["表示名", "名前", "氏名", "スタッフ", "担当", "name", "メンバー"]);

    const get = (row: string[], i: number) => (i >= 0 && row[i] !== undefined ? String(row[i]).trim() : "—");

    const mapped: TodaysShiftRow[] = todayRows.map((row) => ({
      startTime: get(row, idxStart),
      endTime: get(row, idxEnd),
      displayName: get(row, idxName),
    }));

    mapped.sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

    return NextResponse.json({
      rows: mapped,
      source: { fileName: latest.fileName, yearMonth: latest.yearMonth, importedAt: latest.importedAt },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "本日のシフト取得に失敗しました" },
      { status: 500 }
    );
  }
}
