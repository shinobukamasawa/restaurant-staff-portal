import { NextResponse } from "next/server";
import {
  readRepresentativeAssignments,
  writeRepresentativeAssignments,
  type RepresentativeAssignment,
} from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const storeId = searchParams.get("storeId");

    let list = await readRepresentativeAssignments();
    if (date) list = list.filter((a) => a.date === date);
    if (storeId) list = list.filter((a) => a.storeId === storeId);
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "代表者割り当ての取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { date, storeId, assignments } = body as {
      date: string;
      storeId: string;
      assignments: { timeSlotId: string; userId: string }[];
    };
    if (!date || !storeId || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: "date, storeId, assignments が必要です" },
        { status: 400 }
      );
    }

    const all = await readRepresentativeAssignments();
    const others = all.filter((a) => !(a.date === date && a.storeId === storeId));
    const newOnes: RepresentativeAssignment[] = assignments
      .filter((a) => a.userId)
      .map((a) => ({
        date,
        storeId,
        timeSlotId: a.timeSlotId,
        userId: a.userId,
      }));
    await writeRepresentativeAssignments([...others, ...newOnes]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "代表者割り当ての保存に失敗しました" },
      { status: 500 }
    );
  }
}
