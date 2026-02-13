import { NextResponse } from "next/server";
import { readZeninReports, readTimeSlotReports, readTimeSlots } from "@/lib/data";

function buildCombinedSummary(
  zenin: { userId: string; condition: string; busyLevel: string; trouble: string; goodPoint: string; memo: string }[],
  timeslot: { timeSlotId: string; salesEvaluation: string; storeCondition: string; staffing: string; events: string[]; memo: string }[],
  slotNames: Record<string, string>
): string {
  const parts: string[] = [];

  if (zenin.length > 0) {
    parts.push("【全員日報】");
    zenin.forEach((z) => {
      const line = [
        z.condition && `体調: ${z.condition}`,
        z.busyLevel && `忙しさ: ${z.busyLevel}`,
        z.trouble && `困ったこと: ${z.trouble}`,
        z.goodPoint && `良かったこと: ${z.goodPoint}`,
        z.memo && `メモ: ${z.memo}`,
      ]
        .filter(Boolean)
        .join(" / ");
      if (line) parts.push(`・${line}`);
    });
  }

  if (timeslot.length > 0) {
    parts.push("");
    parts.push("【時間帯別日報】");
    timeslot.forEach((t) => {
      const name = slotNames[t.timeSlotId] || t.timeSlotId;
      const line = [
        `売上・状況: ${t.salesEvaluation || "-"}`,
        `店の状況: ${t.storeCondition || "-"}`,
        `人手: ${t.staffing || "-"}`,
        t.events?.length ? `出来事: ${t.events.join(", ")}` : "",
        t.memo ? `メモ: ${t.memo}` : "",
      ]
        .filter(Boolean)
        .join(" / ");
      parts.push(`${name}: ${line}`);
    });
  }

  return parts.length > 0 ? parts.join("\n") : "該当日の全員日報・時間帯別日報はありません。";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const storeId = searchParams.get("storeId");
    const type = searchParams.get("type") || "combined";

    if (!date || !storeId) {
      return NextResponse.json(
        { error: "date と storeId が必要です" },
        { status: 400 }
      );
    }

    const [zeninList, timeslotList, slots] = await Promise.all([
      readZeninReports(),
      readTimeSlotReports(),
      readTimeSlots(),
    ]);

    const zenin = zeninList.filter((r) => r.date === date && r.storeId === storeId);
    const timeslot = timeslotList.filter((r) => r.date === date && r.storeId === storeId);
    const slotNames: Record<string, string> = {};
    slots.forEach((s) => {
      slotNames[s.id] = s.name;
    });

    if (type === "zenin") {
      const text = zenin.length > 0
        ? zenin
            .map(
              (z) =>
                `体調: ${z.condition} / 忙しさ: ${z.busyLevel} / 困ったこと: ${z.trouble} / 良かったこと: ${z.goodPoint}${z.memo ? ` / メモ: ${z.memo}` : ""}`
            )
            .join("\n\n")
        : "該当日の全員日報はありません。";
      return NextResponse.json({ type: "zenin", summary: text, count: zenin.length });
    }

    if (type === "timeslot") {
      const text =
        timeslot.length > 0
          ? timeslot
              .map(
                (t) =>
                  `${slotNames[t.timeSlotId] || t.timeSlotId}: 売上${t.salesEvaluation || "-"} 店舗${t.storeCondition || "-"} 人手${t.staffing || "-"} ${t.events?.length ? t.events.join(",") : ""} ${t.memo || ""}`
              )
              .join("\n\n")
          : "該当日の時間帯別日報はありません。";
      return NextResponse.json({ type: "timeslot", summary: text, count: timeslot.length });
    }

    const combined = buildCombinedSummary(zenin, timeslot, slotNames);
    return NextResponse.json({
      type: "combined",
      summary: combined,
      zeninCount: zenin.length,
      timeslotCount: timeslot.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "要約の取得に失敗しました" },
      { status: 500 }
    );
  }
}
