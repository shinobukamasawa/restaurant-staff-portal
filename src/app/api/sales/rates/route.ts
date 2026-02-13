import { NextResponse } from "next/server";
import { readSalesRates, writeSalesRates, type SalesDayRate } from "@/lib/data";

export async function GET() {
  try {
    const rates = await readSalesRates();
    return NextResponse.json(rates);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "曜日率の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const rates = body as SalesDayRate[];
    if (!Array.isArray(rates) || rates.length !== 7) {
      return NextResponse.json(
        { error: "曜日率は7件（日〜土）必要です" },
        { status: 400 }
      );
    }
    const sorted = [...rates].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    for (let i = 0; i < 7; i++) {
      if (sorted[i].dayOfWeek !== i) {
        return NextResponse.json(
          { error: `dayOfWeek 0〜6 が1つずつ必要です（${i}が不足）` },
          { status: 400 }
        );
      }
    }
    const total = sorted.reduce((s, r) => s + r.rate, 0);
    const average = total / 7;
    if (Math.abs(average - 100) > 0.01) {
      return NextResponse.json(
        { error: "7曜日の率の平均が100%になるように入力してください。（現在の平均: " + Math.round(average * 100) / 100 + "%）" },
        { status: 400 }
      );
    }
    await writeSalesRates(sorted);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "曜日率の保存に失敗しました" },
      { status: 500 }
    );
  }
}
