import { NextResponse } from "next/server";
import { readReports, writeReports, type Report } from "@/lib/data";

export async function GET() {
  try {
    const reports = await readReports();
    return NextResponse.json(reports);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "日報の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      date,
      shiftText,
      busyLevel,
      mood,
      trouble,
      condition,
      workItems,
      memo,
    } = body;

    const reports = await readReports();
    const newReport: Report = {
      id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      date: date || new Date().toISOString().slice(0, 10),
      shiftText: shiftText || "",
      busyLevel: busyLevel || "",
      mood: mood || "",
      trouble: trouble || "",
      condition: condition || "",
      workItems: Array.isArray(workItems) ? workItems : [],
      memo: memo || "",
      createdAt: new Date().toISOString(),
    };
    reports.push(newReport);
    await writeReports(reports);

    return NextResponse.json({ ok: true, id: newReport.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "日報の保存に失敗しました" },
      { status: 500 }
    );
  }
}
