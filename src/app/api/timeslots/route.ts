import { NextResponse } from "next/server";
import { readTimeSlots } from "@/lib/data";

export async function GET() {
  try {
    const slots = await readTimeSlots();
    return NextResponse.json(slots.sort((a, b) => a.sortOrder - b.sortOrder));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "時間帯マスタの取得に失敗しました" },
      { status: 500 }
    );
  }
}
