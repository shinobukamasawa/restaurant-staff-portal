import { NextRequest, NextResponse } from "next/server";
import { readProperties, readLeads, type Property, type Lead } from "@/lib/tenant-leasing";

export interface MatchResult {
  property: Property;
  lead: Lead;
  score: number;
  reasons: string[];
}

function computeMatchScore(property: Property, lead: Lead): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 賃料: 物件の範囲とリード希望の重なり
  const rentOverlap =
    property.rentMin <= lead.desiredRentMax && property.rentMax >= lead.desiredRentMin;
  if (rentOverlap) {
    score += 40;
    reasons.push("賃料が希望範囲と一致");
  } else if (property.rentMax >= lead.desiredRentMin) {
    score += 15;
    reasons.push("賃料がやや希望範囲と近い");
  }

  // 面積: 物件面積がリード希望範囲内か
  const areaMatch =
    property.area >= (lead.desiredAreaMin || 0) &&
    property.area <= (lead.desiredAreaMax || Infinity);
  if (lead.desiredAreaMin || lead.desiredAreaMax) {
    if (areaMatch) {
      score += 30;
      reasons.push("面積が希望範囲内");
    } else if (property.area >= lead.desiredAreaMin) {
      score += 10;
      reasons.push("面積が希望に近い");
    }
  } else {
    score += 15;
    reasons.push("面積条件なし");
  }

  // 業種制限: 物件の業種制限にリードが含まれるか
  if (property.allowedIndustries.length > 0) {
    const leadIndustry = lead.industry.toLowerCase();
    const allowed = property.allowedIndustries.map((s) => s.toLowerCase());
    const allowedMatch = allowed.some(
      (a) => leadIndustry.includes(a) || a.includes(leadIndustry)
    );
    if (allowedMatch) {
      score += 30;
      reasons.push("業種が物件条件に適合");
    } else {
      score -= 20;
      reasons.push("業種が物件制限外");
    }
  } else {
    score += 10;
    reasons.push("業種制限なし");
  }

  const total = Math.max(0, Math.min(100, score));
  return { score: total, reasons };
}

export async function GET(request: NextRequest) {
  try {
    const [properties, leads] = await Promise.all([
      readProperties(),
      readLeads(),
    ]);
    const propertyId = request.nextUrl.searchParams.get("propertyId");
    const leadId = request.nextUrl.searchParams.get("leadId");

    const results: MatchResult[] = [];

    if (propertyId) {
      const property = properties.find((p) => p.id === propertyId);
      if (!property) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }
      for (const lead of leads) {
        const { score, reasons } = computeMatchScore(property, lead);
        results.push({ property, lead, score, reasons });
      }
    } else if (leadId) {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      for (const property of properties) {
        const { score, reasons } = computeMatchScore(property, lead);
        results.push({ property, lead, score, reasons });
      }
    } else {
      for (const property of properties) {
        for (const lead of leads) {
          const { score, reasons } = computeMatchScore(property, lead);
          results.push({ property, lead, score, reasons });
        }
      }
    }

    results.sort((a, b) => b.score - a.score);
    return NextResponse.json(results);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to compute matching" },
      { status: 500 }
    );
  }
}
