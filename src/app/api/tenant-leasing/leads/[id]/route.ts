import { NextRequest, NextResponse } from "next/server";
import { readLeads, writeLeads, type Lead } from "@/lib/tenant-leasing";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = await readLeads();
  const item = list.find((l) => l.id === id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const list = await readLeads();
  const idx = list.findIndex((l) => l.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const now = new Date().toISOString();
  const prev = list[idx];
  const updated: Lead = {
    ...prev,
    companyName: body.companyName !== undefined ? String(body.companyName).trim() : prev.companyName,
    industry: body.industry !== undefined ? String(body.industry).trim() : prev.industry,
    contactName: body.contactName !== undefined ? String(body.contactName).trim() : prev.contactName,
    email: body.email !== undefined ? String(body.email).trim() : prev.email,
    phone: body.phone !== undefined ? String(body.phone).trim() : prev.phone,
    desiredAreas:
      body.desiredAreas !== undefined
        ? (Array.isArray(body.desiredAreas)
            ? body.desiredAreas.map(String)
            : [])
        : prev.desiredAreas,
    desiredRentMin: body.desiredRentMin !== undefined ? Number(body.desiredRentMin) : prev.desiredRentMin,
    desiredRentMax: body.desiredRentMax !== undefined ? Number(body.desiredRentMax) : prev.desiredRentMax,
    desiredAreaMin: body.desiredAreaMin !== undefined ? Number(body.desiredAreaMin) : prev.desiredAreaMin,
    desiredAreaMax: body.desiredAreaMax !== undefined ? Number(body.desiredAreaMax) : prev.desiredAreaMax,
    expansionNotes: body.expansionNotes !== undefined ? String(body.expansionNotes).trim() : prev.expansionNotes,
    memo: body.memo !== undefined ? String(body.memo).trim() : prev.memo,
    updatedAt: now,
  };
  list[idx] = updated;
  await writeLeads(list);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = await readLeads();
  const filtered = list.filter((l) => l.id !== id);
  if (filtered.length === list.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await writeLeads(filtered);
  return NextResponse.json({ ok: true });
}
