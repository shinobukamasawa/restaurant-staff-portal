import { NextRequest, NextResponse } from "next/server";
import {
  readLeads,
  writeLeads,
  generateId,
  type Lead,
} from "@/lib/tenant-leasing";

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      current += c;
    } else if (c === ",") {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must have header and at least one row" },
        { status: 400 }
      );
    }
    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const companyNameIdx = header.findIndex(
      (h) => h.includes("company") || h.includes("企業") || h === "name" || h === "会社名"
    );
    const companyCol = companyNameIdx >= 0 ? companyNameIdx : 0;
    const getCol = (keys: string[]) => {
      const i = header.findIndex((h) =>
        keys.some((k) => h.includes(k) || h === k)
      );
      return i >= 0 ? i : -1;
    };
    const industryCol = getCol(["industry", "業種"]);
    const contactCol = getCol(["contact", "担当", "name"]);
    const emailCol = getCol(["email", "メール"]);
    const phoneCol = getCol(["phone", "tel", "電話"]);
    const areaCol = getCol(["area", "エリア", "希望"]);
    const rentMinCol = getCol(["rentmin", "賃料min", "賃料下限"]);
    const rentMaxCol = getCol(["rentmax", "賃料max", "賃料上限"]);
    const areaMinCol = getCol(["areamin", "面積min"]);
    const areaMaxCol = getCol(["areamax", "面積max"]);
    const memoCol = getCol(["memo", "メモ", "notes"]);

    const existing = await readLeads();
    const existingEmails = new Set(existing.map((l) => l.email.toLowerCase()));
    const now = new Date().toISOString();
    const imported: Lead[] = [];
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const cells = parseCsvLine(lines[i]);
      const companyName = (cells[companyCol] ?? "").trim();
      if (!companyName) continue;
      const email = (emailCol >= 0 ? cells[emailCol] ?? "" : "").trim();
      if (email && existingEmails.has(email.toLowerCase())) {
        skipped++;
        continue;
      }
      const lead: Lead = {
        id: generateId(),
        companyName,
        industry: industryCol >= 0 ? String(cells[industryCol] ?? "").trim() : "",
        contactName: contactCol >= 0 ? String(cells[contactCol] ?? "").trim() : "",
        email: email || "",
        phone: phoneCol >= 0 ? String(cells[phoneCol] ?? "").trim() : "",
        desiredAreas:
          areaCol >= 0 && cells[areaCol]
            ? String(cells[areaCol])
                .split(/[,、]/)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        desiredRentMin: rentMinCol >= 0 ? Number(cells[rentMinCol]) || 0 : 0,
        desiredRentMax: rentMaxCol >= 0 ? Number(cells[rentMaxCol]) || 0 : 0,
        desiredAreaMin: areaMinCol >= 0 ? Number(cells[areaMinCol]) || 0 : 0,
        desiredAreaMax: areaMaxCol >= 0 ? Number(cells[areaMaxCol]) || 0 : 0,
        expansionNotes: "",
        memo: memoCol >= 0 ? String(cells[memoCol] ?? "").trim() : "",
        createdAt: now,
        updatedAt: now,
      };
      imported.push(lead);
      if (lead.email) existingEmails.add(lead.email.toLowerCase());
    }

    const newList = [...existing, ...imported];
    await writeLeads(newList);
    return NextResponse.json({
      imported: imported.length,
      skipped,
      total: newList.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to import CSV" },
      { status: 500 }
    );
  }
}
