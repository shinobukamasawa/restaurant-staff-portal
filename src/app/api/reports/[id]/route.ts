import { NextResponse } from "next/server";
import { readReports, writeReports, type Report } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reports = await readReports();
    const report = reports.find((r) => r.id === id);
    if (!report) {
      return NextResponse.json({ error: "日報が見つかりません" }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "日報の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "日報が見つかりません" }, { status: 404 });
    }

    const updated: Report = {
      ...reports[index],
      date: date ?? reports[index].date,
      shiftText: shiftText ?? reports[index].shiftText,
      busyLevel: busyLevel ?? reports[index].busyLevel,
      mood: mood ?? reports[index].mood,
      trouble: trouble ?? reports[index].trouble,
      condition: condition ?? reports[index].condition,
      workItems: Array.isArray(workItems) ? workItems : reports[index].workItems,
      memo: memo ?? reports[index].memo,
      createdAt: reports[index].createdAt,
    };
    reports[index] = updated;
    await writeReports(reports);
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "日報の更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reports = await readReports();
    const filtered = reports.filter((r) => r.id !== id);
    if (filtered.length === reports.length) {
      return NextResponse.json({ error: "日報が見つかりません" }, { status: 404 });
    }
    await writeReports(filtered);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "日報の削除に失敗しました" },
      { status: 500 }
    );
  }
}
