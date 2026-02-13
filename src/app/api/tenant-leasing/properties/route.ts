import { NextRequest, NextResponse } from "next/server";
import {
  readProperties,
  writeProperties,
  generateId,
  type Property,
} from "@/lib/tenant-leasing";

export async function GET(request: NextRequest) {
  try {
    const list = await readProperties();
    const search = request.nextUrl.searchParams.get("q");
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const filtered = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.memo.toLowerCase().includes(q)
      );
      return NextResponse.json(filtered);
    }
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list properties" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const prop: Property = {
      id: generateId(),
      name: String(body.name ?? "").trim(),
      address: String(body.address ?? "").trim(),
      area: Number(body.area) || 0,
      rentMin: Number(body.rentMin) || 0,
      rentMax: Number(body.rentMax) || 0,
      allowedIndustries: Array.isArray(body.allowedIndustries)
        ? body.allowedIndustries.map(String)
        : [],
      availableFrom: String(body.availableFrom ?? "").trim(),
      memo: String(body.memo ?? "").trim(),
      createdAt: now,
      updatedAt: now,
    };
    const list = await readProperties();
    list.push(prop);
    await writeProperties(list);
    return NextResponse.json(prop);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
