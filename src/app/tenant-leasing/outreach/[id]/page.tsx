"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { OUTREACH_STATUS_LABELS } from "@/lib/tenant-leasing-constants";

type OutreachRecord = {
  id: string;
  propertyId: string;
  leadId: string;
  status: string;
  lastContactAt: string;
  nextActionAt: string | null;
  emailSentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  phoneMemo: string;
  memo: string;
};

export default function OutreachDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [item, setItem] = useState<OutreachRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    status: "",
    nextActionAt: "",
    phoneMemo: "",
    memo: "",
  });

  useEffect(() => {
    fetch(`/api/tenant-leasing/outreach/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setItem(data);
        if (data) {
          setForm({
            status: data.status,
            nextActionAt: data.nextActionAt
              ? data.nextActionAt.slice(0, 10)
              : "",
            phoneMemo: data.phoneMemo ?? "",
            memo: data.memo ?? "",
          });
        }
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tenant-leasing/outreach/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.status,
          nextActionAt: form.nextActionAt || null,
          phoneMemo: form.phoneMemo,
          memo: form.memo,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItem(updated);
      } else alert("更新に失敗しました");
    } catch {
      alert("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-8 text-zinc-500">読み込み中...</p>;
  if (!item) return <p className="p-8 text-zinc-500">見つかりません。</p>;

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-2xl px-6 py-8">
        <Link
          href="/tenant-leasing/outreach"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← アウトリーチ一覧
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900">
          アウトリーチ詳細
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          <Link
            href={`/tenant-leasing/properties/${item.propertyId}`}
            className="hover:underline"
          >
            物件
          </Link>
          {" × "}
          <Link
            href={`/tenant-leasing/leads/${item.leadId}`}
            className="hover:underline"
          >
            リード
          </Link>
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              ステータス
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              {Object.entries(OUTREACH_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              次アクション日（リマインド）
            </label>
            <input
              type="date"
              value={form.nextActionAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, nextActionAt: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              電話メモ
            </label>
            <textarea
              rows={3}
              value={form.phoneMemo}
              onChange={(e) =>
                setForm((f) => ({ ...f, phoneMemo: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              メモ
            </label>
            <textarea
              rows={2}
              value={form.memo}
              onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <Link
              href="/tenant-leasing/outreach"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              一覧へ
            </Link>
          </div>
        </form>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          <p>最終接触: {new Date(item.lastContactAt).toLocaleString("ja-JP")}</p>
          {item.emailSentAt && (
            <p>メール送信: {new Date(item.emailSentAt).toLocaleString("ja-JP")}</p>
          )}
        </div>
      </main>
    </div>
  );
}
