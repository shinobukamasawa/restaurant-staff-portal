import { NextResponse } from "next/server";
import { readNotices } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notices = await readNotices();
    const notice = notices.find((n) => n.id === id);
    if (!notice) {
      return NextResponse.json({ error: "お知らせが見つかりません" }, { status: 404 });
    }
    return NextResponse.json(notice);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "お知らせの取得に失敗しました" },
      { status: 500 }
    );
  }
}
