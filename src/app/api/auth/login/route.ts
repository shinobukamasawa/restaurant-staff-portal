import { NextResponse } from "next/server";
import { readUsers } from "@/lib/data";
import * as bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!id || !password) {
      return NextResponse.json(
        { error: "IDとパスワードを入力してください。" },
        { status: 400 }
      );
    }

    const users = await readUsers();
    const user = users.find((u) => u.id === id);

    if (!user) {
      return NextResponse.json(
        { error: "IDまたはパスワードが違います。" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "このアカウントは利用できません。担当者にお問い合わせください。" },
        { status: 403 }
      );
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return NextResponse.json(
        { error: "IDまたはパスワードが違います。" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      role: user.role,
      userId: user.id,
      displayName: user.displayName ?? user.id,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "ログイン処理に失敗しました。" },
      { status: 500 }
    );
  }
}
