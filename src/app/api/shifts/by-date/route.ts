import { NextResponse } from "next/server";
import { readShifts } from "@/lib/data";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

function parseDate(s: string): string | null {
  const str = String(s).trim();
  const m = str.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/) || str.match(/(\d{2})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (!m) return null;
  const y = m[1].length === 4 ? m[1] : undefined;
  const month = m[2].padStart(2, "0");
  const day = m[3].padStart(2, "0");
  const year = y ?? new Date().getFullYear();
  return `${year}-${month}-${day}`;
}

function toDayOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return "";
  const date = new Date(y, m - 1, d);
  return DOW[date.getDay()] ?? "";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const storeId = searchParams.get("storeId");

    if (!date || !storeId) {
      return NextResponse.json(
        { error: "date と storeId が必要です" },
        { status: 400 }
      );
    }

    const yearMonth = date.slice(0, 7);
    const dateStr = date.slice(0, 10);
    const imports = await readShifts();
    const match = imports
      .filter((imp) => imp.storeId === storeId && imp.yearMonth === yearMonth)
      .sort((a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime())[0];

    if (!match) {
      return NextResponse.json({ rows: [], yearMonth, storeId });
    }

    const rawRows = match.rows || [];
    const rows: { date: string; dayOfWeek: string; startTime: string; endTime: string; displayName: string }[] = [];
    let startIdx = 0;
    if (rawRows.length > 0) {
      const first = rawRows[0];
      const hasDateInFirst = first.some((c) => parseDate(String(c ?? "")) !== null);
      if (!hasDateInFirst && first.some((c) => String(c).length > 0)) startIdx = 1;
    }
    for (let i = startIdx; i < rawRows.length; i++) {
      const row = rawRows[i];
      let dateCol = -1;
      let normalized = "";
      for (let c = 0; c < Math.min(row.length, 10); c++) {
        const parsed = row[c] != null ? parseDate(String(row[c])) : null;
        if (parsed && parsed.slice(0, 10) === dateStr) {
          dateCol = c;
          normalized = parsed.slice(0, 10);
          break;
        }
      }
      if (!normalized) continue;
      // 実CSV: [0]=No, [1]=日付, [2]=曜日, [3]=開始, [4]=終了, [5]=表示名（フルネーム）, …
      let startCol: number, endCol: number, nameCol: number;
      if (dateCol === 1 && row.length >= 6) {
        startCol = 3; endCol = 4; nameCol = 5;
      } else if (dateCol === 0 && row.length >= 6) {
        startCol = 3; endCol = 4; nameCol = 5;
      } else if (dateCol === 0 && row.length >= 5) {
        startCol = 2; endCol = 3; nameCol = 4;
      } else {
        startCol = dateCol <= 1 ? 2 : 1; endCol = dateCol <= 2 ? 3 : 2; nameCol = dateCol === 0 ? 1 : 0;
      }
      const displayName = row[nameCol] != null ? String(row[nameCol]).trim() : "";
      const startTime = row[startCol] != null ? String(row[startCol]).trim() : "";
      const endTime = row[endCol] != null ? String(row[endCol]).trim() : "";
      rows.push({
        date: normalized,
        dayOfWeek: toDayOfWeek(normalized),
        startTime,
        endTime,
        displayName,
      });
    }
    const res: Record<string, unknown> = {
      rows,
      yearMonth: match.yearMonth,
      storeId: match.storeId,
      fileName: match.fileName,
    };
    // 列のずれ確認用: ?debug=1 で該当日の「先頭1行の生データ」を返す（列0, 列1, … の並びで確認できる）
    const debug = searchParams.get("debug");
    if (debug === "1" && rows.length > 0) {
      const firstMatchRow = rawRows.find((r) => {
        for (let c = 0; c < Math.min(r.length, 5); c++) {
          const p = r[c] != null ? parseDate(String(r[c])) : null;
          if (p && p.slice(0, 10) === dateStr) return true;
        }
        return false;
      });
      res._debug = {
        message: "該当日の先頭1行の生データです。列0, 列1, … の順でCSVの並びを確認してください。",
        columnCount: firstMatchRow?.length ?? 0,
        rawRow: firstMatchRow ?? null,
        rawRowWithIndex: firstMatchRow
          ? firstMatchRow.map((v, i) => `[${i}]=${String(v ?? "").trim()}`)
          : null,
      };
    }
    return NextResponse.json(res);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "シフトの取得に失敗しました" },
      { status: 500 }
    );
  }
}
