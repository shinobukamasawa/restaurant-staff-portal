import { NextRequest, NextResponse } from "next/server";
import {
  readEmailTemplates,
  writeEmailTemplates,
  generateId,
  type EmailTemplate,
} from "@/lib/tenant-leasing";

export async function GET() {
  try {
    const list = await readEmailTemplates();
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const template: EmailTemplate = {
      id: generateId(),
      name: String(body.name ?? "").trim(),
      subject: String(body.subject ?? "").trim(),
      body: String(body.body ?? "").trim(),
      createdAt: now,
      updatedAt: now,
    };
    const list = await readEmailTemplates();
    list.push(template);
    await writeEmailTemplates(list);
    return NextResponse.json(template);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
