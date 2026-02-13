import { NextResponse } from "next/server";
import { readUsers, writeUsers, type User, type UserRole } from "@/lib/data";
import * as bcrypt from "bcryptjs";

const ROLES: UserRole[] = ["staff", "manager", "hq"];
const STORE_IDS = ["store-a", "store-b", "hq"];

export async function GET() {
  try {
    const users = await readUsers();
    return NextResponse.json(
      users.filter((u) => u.isActive).map((u) => ({
        id: u.id,
        displayName: u.displayName ?? u.id,
        role: u.role,
        storeId: u.storeId,
      }))
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "ユーザー一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: rawId, password, displayName, role, storeId } = body as {
      id?: string;
      password?: string;
      displayName?: string;
      role?: string;
      storeId?: string;
    };

    const id = String(rawId ?? "").trim().toLowerCase();
    if (!id) {
      return NextResponse.json({ error: "IDを入力してください。" }, { status: 400 });
    }
    if (!/^[a-z0-9_-]+$/i.test(id)) {
      return NextResponse.json(
        { error: "IDは半角英数字・ハイフン・アンダースコアのみ使用できます。" },
        { status: 400 }
      );
    }
    const pass = String(password ?? "").trim();
    if (!pass || pass.length < 4) {
      return NextResponse.json(
        { error: "パスワードは4文字以上で入力してください。" },
        { status: 400 }
      );
    }
    const roleVal = (role === "staff" || role === "manager" || role === "hq" ? role : "staff") as UserRole;
    const storeVal = storeId && STORE_IDS.includes(storeId) ? storeId : undefined;

    const users = await readUsers();
    if (users.some((u) => u.id.toLowerCase() === id)) {
      return NextResponse.json({ error: "このIDは既に登録されています。" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id,
      passwordHash: bcrypt.hashSync(pass, 10),
      role: roleVal,
      storeId: storeVal,
      displayName: String(displayName ?? "").trim() || id,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    users.push(newUser);
    await writeUsers(users);

    return NextResponse.json({
      ok: true,
      user: {
        id: newUser.id,
        displayName: newUser.displayName,
        role: newUser.role,
        storeId: newUser.storeId,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "ユーザーの登録に失敗しました。" },
      { status: 500 }
    );
  }
}
