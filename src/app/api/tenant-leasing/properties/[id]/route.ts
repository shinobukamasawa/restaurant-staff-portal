import { NextRequest, NextResponse } from "next/server";
import {
  readProperties,
  writeProperties,
  type Property,
} from "@/lib/tenant-leasing";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = await readProperties();
  const item = list.find((p) => p.id === id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const list = await readProperties();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const now = new Date().toISOString();
  const prev = list[idx];
  const updated: Property = {
    ...prev,
    name: body.name !== undefined ? String(body.name).trim() : prev.name,
    address: body.address !== undefined ? String(body.address).trim() : prev.address,
    area: body.area !== undefined ? Number(body.area) : prev.area,
    rentMin: body.rentMin !== undefined ? Number(body.rentMin) : prev.rentMin,
    rentMax: body.rentMax !== undefined ? Number(body.rentMax) : prev.rentMax,
    allowedIndustries:
      body.allowedIndustries !== undefined
        ? (Array.isArray(body.allowedIndustries)
            ? body.allowedIndustries.map(String)
            : [])
        : prev.allowedIndustries,
    availableFrom:
      body.availableFrom !== undefined
        ? String(body.availableFrom).trim()
        : prev.availableFrom,
    memo: body.memo !== undefined ? String(body.memo).trim() : prev.memo,
    updatedAt: now,
  };
  list[idx] = updated;
  await writeProperties(list);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = await readProperties();
  const filtered = list.filter((p) => p.id !== id);
  if (filtered.length === list.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await writeProperties(filtered);
  return NextResponse.json({ ok: true });
}
