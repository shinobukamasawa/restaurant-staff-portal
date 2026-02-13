"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Property = {
  id: string;
  name: string;
  address: string;
  area: number;
  rentMin: number;
  rentMax: number;
  allowedIndustries: string[];
};
type Lead = {
  id: string;
  companyName: string;
  industry: string;
  contactName: string;
  email: string;
  desiredRentMin: number;
  desiredRentMax: number;
};
type MatchResult = {
  property: Property;
  lead: Lead;
  score: number;
  reasons: string[];
};

function MatchingContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const leadId = searchParams.get("leadId");
  const [list, setList] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (propertyId) params.set("propertyId", propertyId);
    if (leadId) params.set("leadId", leadId);
    fetch(`/api/tenant-leasing/matching?${params}`)
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [propertyId, leadId]);

  const filtered = list.filter((m) => m.score >= minScore);

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link
          href="/tenant-leasing"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← テナント募集
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          マッチング候補
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          物件×リードの一致度をスコアで表示。スコアが高い順です。
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            最低スコア:
            <input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value) || 0)}
              className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          {(propertyId || leadId) && (
            <Link
              href="/tenant-leasing/matching"
              className="text-sm text-zinc-600 hover:underline"
            >
              全件表示
            </Link>
          )}
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-zinc-500">読み込み中...</p>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
            候補がありません。物件・リードを登録するか、最低スコアを下げてください。
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {filtered.map((m) => (
              <li
                key={`${m.property.id}-${m.lead.id}`}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/tenant-leasing/properties/${m.property.id}`}
                        className="font-medium text-zinc-900 hover:underline"
                      >
                        {m.property.name}
                      </Link>
                      <span className="text-zinc-400">×</span>
                      <Link
                        href={`/tenant-leasing/leads/${m.lead.id}`}
                        className="font-medium text-zinc-900 hover:underline"
                      >
                        {m.lead.companyName}
                      </Link>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">
                      {m.property.address} ／ {m.property.area}㎡ ／
                      {m.property.rentMin.toLocaleString()}〜
                      {m.property.rentMax.toLocaleString()}円
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-600">
                      {m.lead.industry}
                      {m.lead.contactName && ` ／ ${m.lead.contactName}`}
                    </p>
                    {m.reasons.length > 0 && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {m.reasons.join("、")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        m.score >= 70
                          ? "bg-green-100 text-green-800"
                          : m.score >= 40
                            ? "bg-amber-100 text-amber-800"
                            : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {m.score} 点
                    </span>
                    <Link
                      href={`/tenant-leasing/outreach?propertyId=${m.property.id}&leadId=${m.lead.id}`}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      アウトリーチ
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function MatchingPage() {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-500">読み込み中...</p>}>
      <MatchingContent />
    </Suspense>
  );
}
