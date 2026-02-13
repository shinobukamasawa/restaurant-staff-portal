import { NextRequest, NextResponse } from "next/server";
import {
  readOutreach,
  writeOutreach,
  generateId,
  type OutreachRecord,
  type OutreachStatus,
} from "@/lib/tenant-leasing";

export async function GET(request: NextRequest) {
  try {
    let list = await readOutreach();
    const propertyId = request.nextUrl.searchParams.get("propertyId");
    const leadId = request.nextUrl.searchParams.get("leadId");
    const status = request.nextUrl.searchParams.get("status") as OutreachStatus | null;

    if (propertyId) list = list.filter((o) => o.propertyId === propertyId);
    if (leadId) list = list.filter((o) => o.leadId === leadId);
    if (status) list = list.filter((o) => o.status === status);

    list.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list outreach" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const list = await readOutreach();
    const existing = list.find(
      (o) =>
        o.propertyId === body.propertyId &&
        o.leadId === body.leadId
    );
    if (existing) {
      return NextResponse.json(existing);
    }
    const now = new Date().toISOString();
    const record: OutreachRecord = {
      id: generateId(),
      propertyId: String(body.propertyId ?? ""),
      leadId: String(body.leadId ?? ""),
      status: (body.status as OutreachStatus) ?? "not_contacted",
      lastContactAt: body.lastContactAt ?? now,
      nextActionAt: body.nextActionAt ?? null,
      emailSentAt: body.emailSentAt ?? null,
      openedAt: body.openedAt ?? null,
      clickedAt: body.clickedAt ?? null,
      phoneMemo: String(body.phoneMemo ?? "").trim(),
      memo: String(body.memo ?? "").trim(),
      createdAt: now,
      updatedAt: now,
    };
    list.push(record);
    await writeOutreach(list);
    return NextResponse.json(record);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create outreach" },
      { status: 500 }
    );
  }
}
