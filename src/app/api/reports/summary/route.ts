import { NextResponse } from "next/server";
import { readReports, readManagerReports } from "@/lib/data";

function getDateRange(period: string): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  let start: string;
  if (period === "day") {
    start = end;
  } else if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    start = d.toISOString().slice(0, 10);
  } else {
    // 今月1日
    start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  }
  return { start, end };
}

function buildSimpleSummary(reports: { date: string; busyLevel: string; mood: string; trouble: string; memo: string; workItems: string[] }[]): string {
  if (reports.length === 0) return "該当期間の日報はありません。";
  const lines = reports.map((r) => {
    const parts = [`【${r.date}】`, `忙しさ: ${r.busyLevel}`, `雰囲気: ${r.mood}`, `トラブル: ${r.trouble}`];
    if (r.workItems.length) parts.push(`業務: ${r.workItems.join(", ")}`);
    if (r.memo) parts.push(`メモ: ${r.memo}`);
    return parts.join(" / ");
  });
  return lines.join("\n\n");
}

function buildManagerSummary(reports: { date: string; storeId: string; salesEvaluation: string; storeCondition: string; staffing: string; events: string[]; themes: string[]; memo: string }[]): string {
  if (reports.length === 0) return "該当期間の店長日報はありません。";
  return reports
    .map(
      (r) =>
        `【${r.date} ${r.storeId}】売上: ${r.salesEvaluation} 店舗: ${r.storeCondition} 人員: ${r.staffing}${r.events.length ? ` 出来事: ${r.events.join(", ")}` : ""}${r.themes.length ? ` テーマ: ${r.themes.join(", ")}` : ""}${r.memo ? `\nメモ: ${r.memo}` : ""}`
    )
    .join("\n\n");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get("period") || "week";
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    let start: string;
    let end: string;
    let period = periodParam;

    if (startParam && endParam) {
      const s = startParam.slice(0, 10);
      const e = endParam.slice(0, 10);
      if (s > e) {
        return NextResponse.json({ error: "開始日は終了日以前にしてください" }, { status: 400 });
      }
      start = s;
      end = e;
      period = "custom";
    } else {
      if (!["day", "week", "month"].includes(periodParam)) {
        return NextResponse.json({ error: "period は day / week / month のいずれかです" }, { status: 400 });
      }
      const range = getDateRange(periodParam);
      start = range.start;
      end = range.end;
    }

    const [reports, managerReports] = await Promise.all([readReports(), readManagerReports()]);
    const filtered = reports.filter((r) => r.date >= start && r.date <= end);
    const filteredManager = managerReports.filter((r) => r.date >= start && r.date <= end);

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const textForAi = filtered
        .map(
          (r) =>
            `日付: ${r.date}\n忙しさ: ${r.busyLevel} 雰囲気: ${r.mood} トラブル: ${r.trouble} コンディション: ${r.condition}\n主な業務: ${r.workItems.join(", ")}\nひとことメモ: ${r.memo}`
        )
        .join("\n\n---\n\n");

      if (textForAi.trim()) {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "あなたは飲食店の店長向けアシスタントです。スタッフの日報を読み、要点を3〜5行で簡潔に要約してください。良い点・課題・気になる点を分けて書いてください。",
              },
              {
                role: "user",
                content: `以下の日報を要約してください。\n\n${textForAi}`,
              },
            ],
            max_tokens: 500,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const summary = data.choices?.[0]?.message?.content?.trim();
          if (summary) {
            return NextResponse.json({
              period,
              start,
              end,
              count: filtered.length,
              summary,
              source: "openai",
              managerCount: filteredManager.length,
              managerSummary: buildManagerSummary(filteredManager),
            });
          }
        }
      }
    }

    const summary = buildSimpleSummary(filtered);
    const managerSummary = buildManagerSummary(filteredManager);
    return NextResponse.json({
      period,
      start,
      end,
      count: filtered.length,
      summary,
      source: "simple",
      managerCount: filteredManager.length,
      managerSummary,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "要約の取得に失敗しました" },
      { status: 500 }
    );
  }
}
