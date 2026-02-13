import { NextResponse } from "next/server";
import {
  readSalesRates,
  readSalesTargetsMonthly,
  readSalesDaily,
} from "@/lib/data";

function getDaysInMonth(yearMonth: string): { date: string; dayOfWeek: number }[] {
  const [y, m] = yearMonth.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const days: { date: string; dayOfWeek: number }[] = [];
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(y, m - 1, d);
    const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ date: dateStr, dayOfWeek: date.getDay() });
  }
  return days;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const yearMonth = searchParams.get("yearMonth");
    if (!storeId || !yearMonth) {
      return NextResponse.json(
        { error: "storeId と yearMonth が必要です" },
        { status: 400 }
      );
    }

    const [rates, targets, dailyList] = await Promise.all([
      readSalesRates(),
      readSalesTargetsMonthly(),
      readSalesDaily(),
    ]);
    const monthlyTarget = targets.find(
      (t) => t.storeId === storeId && t.yearMonth === yearMonth
    );
    const rateByDow: Record<number, number> = {};
    rates.forEach((r) => {
      rateByDow[r.dayOfWeek] = r.rate;
    });

    const days = getDaysInMonth(yearMonth);
    const monthlyAmount = monthlyTarget?.amount ?? 0;

    const dailyActualMap: Record<string, number> = {};
    dailyList
      .filter((d) => d.storeId === storeId && d.date.startsWith(yearMonth))
      .forEach((d) => {
        dailyActualMap[d.date] = d.amount;
      });

    const totalActual = days.reduce((s, d) => s + (dailyActualMap[d.date] ?? 0), 0);
    const remainingTarget = monthlyAmount - totalActual;
    const today = new Date().toISOString().slice(0, 10);

    // 今月の全日の曜日率合計（過去日の目標表示用）
    const totalRateMonth = days.reduce((s, d) => s + (rateByDow[d.dayOfWeek] ?? 1), 0);
    // 明日以降の日だけ（残り日数）
    const futureDaysList = days.filter((d) => d.date > today);
    const totalRateFuture =
      futureDaysList.length > 0
        ? futureDaysList.reduce((s, d) => s + (rateByDow[d.dayOfWeek] ?? 1), 0)
        : 0;

    // 日ごとの目標:
    // - 過去・今日: 月初時点の按分（月間目標×曜日率/月間率合計）
    // - 明日以降: 「残り目標」を明日〜月末の曜日率で按分 → 1日あたり現実的な金額になる
    const daily: { date: string; target: number; actual: number; achievement: number }[] = [];
    for (const { date, dayOfWeek } of days) {
      const actual = dailyActualMap[date] ?? 0;
      const rate = rateByDow[dayOfWeek] ?? 1;
      let target: number;
      if (date <= today) {
        target =
          totalRateMonth > 0
            ? Math.round((monthlyAmount * rate) / totalRateMonth)
            : 0;
      } else {
        target =
          totalRateFuture > 0
            ? Math.round((remainingTarget * rate) / totalRateFuture)
            : 0;
      }
      const achievement = target > 0 ? Math.round((actual / target) * 100) : 0;
      daily.push({ date, target, actual, achievement });
    }

    const totalTarget = daily.reduce((s, d) => s + d.target, 0);
    const monthlyAchievement = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

    return NextResponse.json({
      storeId,
      yearMonth,
      monthlyTarget: monthlyAmount,
      totalTarget,
      totalActual,
      monthlyAchievement,
      remainingDays: futureDaysList.length,
      remainingTarget,
      daily,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "サマリーの取得に失敗しました" },
      { status: 500 }
    );
  }
}
