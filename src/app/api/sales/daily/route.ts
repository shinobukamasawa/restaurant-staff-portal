import { NextResponse } from "next/server";
import { readSalesDaily, writeSalesDaily, type SalesDaily } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const date = searchParams.get("date");
    const yearMonth = searchParams.get("yearMonth");

    let list = await readSalesDaily();
    if (storeId) list = list.filter((d) => d.storeId === storeId);
    if (date) list = list.filter((d) => d.date === date);
    if (yearMonth)
      list = list.filter((d) => d.date.startsWith(yearMonth));
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "日別実績の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId, date, amount } = body;
    if (!storeId || !date || typeof amount !== "number") {
      return NextResponse.json(
        { error: "storeId, date, amount が必要です" },
        { status: 400 }
      );
    }
    const list = await readSalesDaily();
    const idx = list.findIndex(
      (d) => d.storeId === storeId && d.date === date
    );
    const entry: SalesDaily = { storeId, date, amount };
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.push(entry);
    }
    await writeSalesDaily(list);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "日別実績の保存に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
