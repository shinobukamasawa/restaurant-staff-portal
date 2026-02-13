import { NextRequest, NextResponse } from "next/server";
import {
  readOutreach,
  writeOutreach,
  type OutreachRecord,
  type OutreachStatus,
} from "@/lib/tenant-leasing";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = await readOutreach();
  const item = list.find((o) => o.id === id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const list = await readOutreach();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const now = new Date().toISOString();
  const prev = list[idx];
  const updated: OutreachRecord = {
    ...prev,
    status: (body.status as OutreachStatus) ?? prev.status,
    lastContactAt: body.lastContactAt ?? prev.lastContactAt,
    nextActionAt: body.nextActionAt !== undefined ? body.nextActionAt : prev.nextActionAt,
    emailSentAt: body.emailSentAt !== undefined ? body.emailSentAt : prev.emailSentAt,
    openedAt: body.openedAt !== undefined ? body.openedAt : prev.openedAt,
    clickedAt: body.clickedAt !== undefined ? body.clickedAt : prev.clickedAt,
    phoneMemo: body.phoneMemo !== undefined ? String(body.phoneMemo).trim() : prev.phoneMemo,
    memo: body.memo !== undefined ? String(body.memo).trim() : prev.memo,
    updatedAt: now,
  };
  list[idx] = updated;
  await writeOutreach(list);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = await readOutreach();
  const filtered = list.filter((o) => o.id !== id);
  if (filtered.length === list.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await writeOutreach(filtered);
  return NextResponse.json({ ok: true });
}
