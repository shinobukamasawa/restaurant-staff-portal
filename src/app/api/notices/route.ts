import { NextResponse } from "next/server";
import { readNotices, writeNotices, type Notice } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    let notices = await readNotices();
    notices = notices.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    if (storeId) {
      notices = notices.filter((n) => n.storeId === storeId || n.storeId === "all");
    }
    return NextResponse.json(notices);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "お知らせの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as { title?: string; body?: string; storeId?: string };
    const title = data.title;
    const noticeBody = data.body;
    const storeId = data.storeId;
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "タイトルを入力してください" }, { status: 400 });
    }
    const notices = await readNotices();
    const newNotice: Notice = {
      id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: title.trim(),
      body: typeof noticeBody === "string" ? noticeBody : "",
      storeId: storeId === "all" || !storeId ? "all" : String(storeId),
      createdAt: new Date().toISOString(),
    };
    notices.unshift(newNotice);
    await writeNotices(notices);
    return NextResponse.json({ ok: true, id: newNotice.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "お知らせの保存に失敗しました" },
      { status: 500 }
    );
  }
}
