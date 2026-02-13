import { NextResponse } from "next/server";
import {
  readTimeSlotReports,
  writeTimeSlotReports,
  type TimeSlotReport,
} from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const storeId = searchParams.get("storeId");
    const timeSlotId = searchParams.get("timeSlotId");

    let list = await readTimeSlotReports();
    if (date) list = list.filter((r) => r.date === date);
    if (storeId) list = list.filter((r) => r.storeId === storeId);
    if (timeSlotId) list = list.filter((r) => r.timeSlotId === timeSlotId);
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "時間帯別日報の取得に失敗しました" },
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
      timeSlotId,
      userId,
      salesEvaluation,
      storeCondition,
      staffing,
      events,
      memo,
    } = body;

    const reports = await readTimeSlotReports();
    const existing = reports.find(
      (r) =>
        r.date === (date || "") &&
        r.storeId === (storeId || "") &&
        r.timeSlotId === (timeSlotId || "")
    );
    const report: TimeSlotReport = {
      id: existing?.id ?? `ts-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      date: date || new Date().toISOString().slice(0, 10),
      storeId: storeId || "store-a",
      timeSlotId: timeSlotId || "lunch",
      userId: userId || "",
      salesEvaluation: salesEvaluation ?? "",
      storeCondition: storeCondition ?? "",
      staffing: staffing ?? "",
      events: Array.isArray(events) ? events : [],
      memo: memo ?? "",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    const next = existing
      ? reports.map((r) => (r.id === existing.id ? report : r))
      : [...reports, report];
    await writeTimeSlotReports(next);
    return NextResponse.json({ ok: true, id: report.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "時間帯別日報の保存に失敗しました" },
      { status: 500 }
    );
  }
}
