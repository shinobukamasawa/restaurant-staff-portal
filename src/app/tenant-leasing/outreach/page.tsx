"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OUTREACH_STATUS_LABELS } from "@/lib/tenant-leasing-constants";

type OutreachRecord = {
  id: string;
  propertyId: string;
  leadId: string;
  status: string;
  lastContactAt: string;
  nextActionAt: string | null;
  emailSentAt: string | null;
  phoneMemo: string;
  memo: string;
  daysUntil?: number | null;
};

type Property = { id: string; name: string };
type Lead = { id: string; companyName: string };

function OutreachContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const leadId = searchParams.get("leadId");
  const [outreachList, setOutreachList] = useState<OutreachRecord[]>([]);
  const [reminders, setReminders] = useState<OutreachRecord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (propertyId) params.set("propertyId", propertyId);
    if (leadId) params.set("leadId", leadId);
    Promise.all([
      fetch(`/api/tenant-leasing/outreach?${params}`).then((r) => r.json()),
      fetch("/api/tenant-leasing/outreach/reminders").then((r) => r.json()),
      fetch("/api/tenant-leasing/properties").then((r) => r.json()),
      fetch("/api/tenant-leasing/leads").then((r) => r.json()),
    ])
      .then(([outreach, rem, props, leadList]) => {
        setOutreachList(Array.isArray(outreach) ? outreach : []);
        setReminders(Array.isArray(rem) ? rem : []);
        setProperties(Array.isArray(props) ? props : []);
        setLeads(Array.isArray(leadList) ? leadList : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propertyId, leadId]);

  useEffect(() => {
    if (!propertyId || !leadId || outreachList.length > 0) return;
    fetch("/api/tenant-leasing/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, leadId }),
    })
      .then((r) => r.json())
      .then((created) => {
        if (created.id) setOutreachList((prev) => [created, ...prev]);
      })
      .catch(() => {});
  }, [propertyId, leadId, outreachList.length]);

  const getPropertyName = (id: string) =>
    properties.find((p) => p.id === id)?.name ?? id;
  const getLeadName = (id: string) =>
    leads.find((l) => l.id === id)?.companyName ?? id;

  const filtered = statusFilter
    ? outreachList.filter((o) => o.status === statusFilter)
    : outreachList;

  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString("ja-JP") : "—";

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
          アウトリーチ・リマインド
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          履歴とステータス、次アクションのリマインドを管理します。
        </p>

        {reminders.length > 0 && (
          <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
            <h2 className="text-sm font-medium text-amber-900">
              リマインド（次アクションあり）
            </h2>
            <ul className="mt-2 space-y-2">
              {reminders.slice(0, 10).map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-amber-800">
                    {formatDate(r.nextActionAt)}
                    {r.daysUntil != null && (
                      <span className="ml-1 text-amber-600">
                        {r.daysUntil < 0
                          ? `（${-r.daysUntil}日経過）`
                          : r.daysUntil === 0
                            ? "（今日）"
                            : `（${r.daysUntil}日後）`}
                      </span>
                    )}
                  </span>
                  <Link
                    href={`/tenant-leasing/outreach/${r.id}`}
                    className="font-medium text-zinc-900 hover:underline"
                  >
                    {getPropertyName(r.propertyId)} × {getLeadName(r.leadId)}
                  </Link>
                  <span className="text-zinc-500">
                    {OUTREACH_STATUS_LABELS[r.status as keyof typeof OUTREACH_STATUS_LABELS] ?? r.status}
                  </span>
                </li>
              ))}
            </ul>
            {reminders.length > 10 && (
              <p className="mt-2 text-xs text-amber-700">
                他 {reminders.length - 10} 件
              </p>
            )}
          </section>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            ステータスで絞り込み:
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-zinc-300 px-2 py-1 text-sm"
            >
              <option value="">すべて</option>
              {Object.entries(OUTREACH_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-zinc-500">読み込み中...</p>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
            アウトリーチ履歴がありません。マッチング画面から「アウトリーチ」で追加できます。
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {filtered.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/tenant-leasing/outreach/${o.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-zinc-900">
                          {getPropertyName(o.propertyId)} × {getLeadName(o.leadId)}
                        </span>
                        <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                          {OUTREACH_STATUS_LABELS[o.status as keyof typeof OUTREACH_STATUS_LABELS] ?? o.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600">
                        最終接触: {formatDate(o.lastContactAt)}
                        {o.nextActionAt && (
                          <span className="ml-2 text-amber-700">
                            次アクション: {formatDate(o.nextActionAt)}
                          </span>
                        )}
                      </p>
                      {(o.phoneMemo || o.memo) && (
                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                          {o.phoneMemo || o.memo}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function OutreachPage() {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-500">読み込み中...</p>}>
      <OutreachContent />
    </Suspense>
  );
}
