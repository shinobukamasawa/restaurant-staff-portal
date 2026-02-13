import { NextResponse } from "next/server";
import { readOutreach } from "@/lib/tenant-leasing";

export async function GET() {
  try {
    const list = await readOutreach();
    const now = new Date();
    const inDays = (d: string | null) => {
      if (!d) return null;
      const t = new Date(d).getTime();
      const diff = Math.ceil((t - now.getTime()) / (24 * 60 * 60 * 1000));
      return diff;
    };
    const withNextAction = list.filter((o) => o.nextActionAt != null);
    const reminders = withNextAction.map((o) => ({
      ...o,
      daysUntil: inDays(o.nextActionAt),
    }));
    reminders.sort((a, b) => {
      const da = a.nextActionAt ? new Date(a.nextActionAt).getTime() : 0;
      const db = b.nextActionAt ? new Date(b.nextActionAt).getTime() : 0;
      return da - db;
    });
    return NextResponse.json(reminders);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to get reminders" },
      { status: 500 }
    );
  }
}
