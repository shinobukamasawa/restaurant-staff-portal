import { NextResponse } from "next/server";
import {
  readSalesTargetsMonthly,
  writeSalesTargetsMonthly,
  type SalesTargetMonthly,
} from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const yearMonth = searchParams.get("yearMonth");

    let list = await readSalesTargetsMonthly();
    if (storeId) list = list.filter((t) => t.storeId === storeId);
    if (yearMonth) list = list.filter((t) => t.yearMonth === yearMonth);
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "月間目標の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId, yearMonth, amount } = body;
    if (!storeId || !yearMonth || typeof amount !== "number") {
      return NextResponse.json(
        { error: "storeId, yearMonth, amount が必要です" },
        { status: 400 }
      );
    }
    const targets = await readSalesTargetsMonthly();
    const exists = targets.some(
      (t) => t.storeId === storeId && t.yearMonth === yearMonth
    );
    if (exists) {
      return NextResponse.json(
        { error: "同じ店舗・年月の目標が既にあります" },
        { status: 400 }
      );
    }
    targets.push({ storeId, yearMonth, amount });
    await writeSalesTargetsMonthly(targets);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "月間目標の登録に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { storeId, yearMonth, amount } = body;
    if (!storeId || !yearMonth || typeof amount !== "number") {
      return NextResponse.json(
        { error: "storeId, yearMonth, amount が必要です" },
        { status: 400 }
      );
    }
    const targets = await readSalesTargetsMonthly();
    const idx = targets.findIndex(
      (t) => t.storeId === storeId && t.yearMonth === yearMonth
    );
    if (idx === -1) {
      return NextResponse.json(
        { error: "該当する月間目標が見つかりません" },
        { status: 404 }
      );
    }
    targets[idx] = { ...targets[idx], amount };
    await writeSalesTargetsMonthly(targets);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "月間目標の更新に失敗しました" },
      { status: 500 }
    );
  }
}
