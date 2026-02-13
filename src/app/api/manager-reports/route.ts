import { NextResponse } from "next/server";
import {
  readManagerReports,
  writeManagerReports,
  type ManagerReport,
} from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const storeId = searchParams.get("storeId");

    let reports = await readManagerReports();
    if (date) reports = reports.filter((r) => r.date === date);
    if (storeId) reports = reports.filter((r) => r.storeId === storeId);
    reports = reports.sort((a, b) => b.date.localeCompare(a.date));
    return NextResponse.json(reports);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "店長日報の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      date,
      storeId,
      salesEvaluation,
      storeCondition,
      staffing,
      events,
      themes,
      memo,
      combinedSummary,
    } = body;

    const reports = await readManagerReports();
    const newReport: ManagerReport = {
      id: `mgr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      date: date || new Date().toISOString().slice(0, 10),
      storeId: storeId || "store-a",
      salesEvaluation: salesEvaluation || "",
      storeCondition: storeCondition || "",
      staffing: staffing || "",
      events: Array.isArray(events) ? events : [],
      themes: Array.isArray(themes) ? themes : [],
      memo: memo || "",
      combinedSummary: combinedSummary != null ? String(combinedSummary) : undefined,
      createdAt: new Date().toISOString(),
    };
    reports.push(newReport);
    await writeManagerReports(reports);

    return NextResponse.json({ ok: true, id: newReport.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "店長日報の保存に失敗しました" },
      { status: 500 }
    );
  }
}
