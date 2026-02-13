import { NextRequest, NextResponse } from "next/server";
import {
  readEmailTemplates,
  readLeads,
  readOutreach,
  writeOutreach,
  generateId,
} from "@/lib/tenant-leasing";

function substituteVars(text: string, vars: Record<string, string>): string {
  let out = text;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`{{${k}}}`, "g"), v);
  }
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const templateId = body.templateId as string;
    const leadIds = Array.isArray(body.leadIds) ? body.leadIds as string[] : [];
    const propertyId = (body.propertyId as string) || null;

    if (!templateId || leadIds.length === 0) {
      return NextResponse.json(
        { error: "templateId and leadIds are required" },
        { status: 400 }
      );
    }

    const [templates, leads, outreachList] = await Promise.all([
      readEmailTemplates(),
      readLeads(),
      readOutreach(),
    ]);
    const template = templates.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const results: { leadId: string; sent: boolean; outreachId?: string }[] = [];
    let updatedOutreach = [...outreachList];
    const mailProviderConfigured = !!process.env.RESEND_API_KEY;

    for (const leadId of leadIds) {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead || !lead.email) {
        results.push({ leadId, sent: false });
        continue;
      }
      const pid = propertyId || updatedOutreach.find((o) => o.leadId === leadId)?.propertyId;
      const subject = substituteVars(template.subject, {
        companyName: lead.companyName,
        contactName: lead.contactName,
      });
      const bodyText = substituteVars(template.body, {
        companyName: lead.companyName,
        contactName: lead.contactName,
        email: lead.email,
      });

      if (mailProviderConfigured && process.env.RESEND_API_KEY) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || "onboarding@resend.dev",
              to: lead.email,
              subject,
              text: bodyText,
            }),
          });
          if (!res.ok) {
            results.push({ leadId, sent: false });
            continue;
          }
        } catch {
          results.push({ leadId, sent: false });
          continue;
        }
      }

      let outreach = updatedOutreach.find(
        (o) => o.leadId === leadId && (o.propertyId === pid || !pid)
      );
      if (!outreach && pid) {
        outreach = {
          id: generateId(),
          propertyId: pid,
          leadId,
          status: "sent",
          lastContactAt: now,
          nextActionAt: null,
          emailSentAt: now,
          openedAt: null,
          clickedAt: null,
          phoneMemo: "",
          memo: "",
          createdAt: now,
          updatedAt: now,
        };
        updatedOutreach.push(outreach);
        results.push({ leadId, sent: true, outreachId: outreach.id });
      } else if (outreach) {
        const idx = updatedOutreach.findIndex((o) => o.id === outreach!.id);
        updatedOutreach[idx] = {
          ...outreach,
          status: "sent",
          lastContactAt: now,
          emailSentAt: now,
          updatedAt: now,
        };
        results.push({ leadId, sent: true, outreachId: outreach.id });
      } else {
        results.push({ leadId, sent: true });
      }
    }

    await writeOutreach(updatedOutreach);
    return NextResponse.json({
      ok: true,
      results,
      message: mailProviderConfigured
        ? "送信リクエストを処理しました"
        : "送信ログを記録しました（RESEND_API_KEY 未設定のため実際の送信は行っていません）",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
