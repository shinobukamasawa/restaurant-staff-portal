import { NextResponse } from "next/server";
import { readUsers, writeUsers, type User } from "@/lib/data";
import * as bcrypt from "bcryptjs";

const DEFAULT_USERS = [
  { id: "admin", password: "admin123", role: "hq" as const, storeId: "hq", displayName: "管理者" },
  { id: "manager", password: "manager123", role: "manager" as const, storeId: "store-a", displayName: "店長" },
  { id: "staff", password: "staff123", role: "staff" as const, storeId: "store-a", displayName: "スタッフ" },
];

export async function GET() {
  try {
    const users = await readUsers();
    const existingIds = new Set(users.map((u) => u.id));
    const toAdd = DEFAULT_USERS.filter((u) => !existingIds.has(u.id));
    if (toAdd.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "初期ユーザーは既に存在します。",
        users: users.map((u) => ({ id: u.id, role: u.role })),
      });
    }
    const now = new Date().toISOString();
    for (const u of toAdd) {
      const newUser: User = {
        id: u.id,
        passwordHash: bcrypt.hashSync(u.password, 10),
        role: u.role,
        storeId: u.storeId,
        displayName: u.displayName,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      users.push(newUser);
    }
    await writeUsers(users);
    return NextResponse.json({
      ok: true,
      message: toAdd.length + " 件のユーザーを追加しました。",
      added: toAdd.map((u) => ({ id: u.id, role: u.role })),
      login: { admin: "admin / admin123", manager: "manager / manager123", staff: "staff / staff123" },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "初期ユーザーの作成に失敗しました。" },
      { status: 500 }
    );
  }
}
