import { NextResponse } from "next/server";
import {
  readZeninReports,
  writeZeninReports,
  type ZeninReport,
} from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const storeId = searchParams.get("storeId");

    let list = await readZeninReports();
    if (date) list = list.filter((r) => r.date === date);
    if (storeId) list = list.filter((r) => r.storeId === storeId);
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "全員用日報の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, storeId, userId, condition, busyLevel, trouble, goodPoint, memo } = body;

    const reports = await readZeninReports();
    const existing = reports.find(
      (r) => r.date === (date || "") && r.storeId === (storeId || "") && r.userId === (userId || "")
    );
    const report: ZeninReport = {
      id: existing?.id ?? `zenin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      date: date || new Date().toISOString().slice(0, 10),
      storeId: storeId || "store-a",
      userId: userId || "",
      condition: condition ?? "",
      busyLevel: busyLevel ?? "",
      trouble: trouble ?? "",
      goodPoint: goodPoint ?? "",
      memo: memo ?? "",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    const next = existing
      ? reports.map((r) => (r.id === existing.id ? report : r))
      : [...reports, report];
    await writeZeninReports(next);
    return NextResponse.json({ ok: true, id: report.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "全員用日報の保存に失敗しました" },
      { status: 500 }
    );
  }
}
