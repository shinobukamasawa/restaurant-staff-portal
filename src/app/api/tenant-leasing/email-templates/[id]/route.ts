import { NextRequest, NextResponse } from "next/server";
import {
  readEmailTemplates,
  writeEmailTemplates,
  type EmailTemplate,
} from "@/lib/tenant-leasing";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = await readEmailTemplates();
  const item = list.find((t) => t.id === id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const list = await readEmailTemplates();
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const now = new Date().toISOString();
  const prev = list[idx];
  const updated: EmailTemplate = {
    ...prev,
    name: body.name !== undefined ? String(body.name).trim() : prev.name,
    subject: body.subject !== undefined ? String(body.subject).trim() : prev.subject,
    body: body.body !== undefined ? String(body.body).trim() : prev.body,
    updatedAt: now,
  };
  list[idx] = updated;
  await writeEmailTemplates(list);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = await readEmailTemplates();
  const filtered = list.filter((t) => t.id !== id);
  if (filtered.length === list.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await writeEmailTemplates(filtered);
  return NextResponse.json({ ok: true });
}
