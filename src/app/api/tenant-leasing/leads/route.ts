import { NextRequest, NextResponse } from "next/server";
import {
  readLeads,
  writeLeads,
  generateId,
  type Lead,
} from "@/lib/tenant-leasing";

export async function GET(request: NextRequest) {
  try {
    const list = await readLeads();
    const search = request.nextUrl.searchParams.get("q");
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const filtered = list.filter(
        (l) =>
          l.companyName.toLowerCase().includes(q) ||
          l.industry.toLowerCase().includes(q) ||
          l.contactName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.memo.toLowerCase().includes(q)
      );
      return NextResponse.json(filtered);
    }
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const lead: Lead = {
      id: generateId(),
      companyName: String(body.companyName ?? "").trim(),
      industry: String(body.industry ?? "").trim(),
      contactName: String(body.contactName ?? "").trim(),
      email: String(body.email ?? "").trim(),
      phone: String(body.phone ?? "").trim(),
      desiredAreas: Array.isArray(body.desiredAreas)
        ? body.desiredAreas.map(String)
        : [],
      desiredRentMin: Number(body.desiredRentMin) ?? 0,
      desiredRentMax: Number(body.desiredRentMax) ?? 0,
      desiredAreaMin: Number(body.desiredAreaMin) ?? 0,
      desiredAreaMax: Number(body.desiredAreaMax) ?? 0,
      expansionNotes: String(body.expansionNotes ?? "").trim(),
      memo: String(body.memo ?? "").trim(),
      createdAt: now,
      updatedAt: now,
    };
    const list = await readLeads();
    list.push(lead);
    await writeLeads(list);
    return NextResponse.json(lead);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
