"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Lead = {
  id: string;
  companyName: string;
  industry: string;
  contactName: string;
  email: string;
  phone: string;
  desiredAreas: string[];
  desiredRentMin: number;
  desiredRentMax: number;
  desiredAreaMin: number;
  desiredAreaMax: number;
  expansionNotes: string;
  memo: string;
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [item, setItem] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tenant-leasing/leads/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("このリードを削除しますか？")) return;
    const res = await fetch(`/api/tenant-leasing/leads/${id}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/tenant-leasing/leads");
    else alert("削除に失敗しました");
  };

  if (loading) return <p className="p-8 text-zinc-500">読み込み中...</p>;
  if (!item) return <p className="p-8 text-zinc-500">リードが見つかりません。</p>;

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-2xl px-6 py-8">
        <Link
          href="/tenant-leasing/leads"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← リード一覧
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {item.companyName}
          </h1>
          <div className="flex gap-2">
            <Link
              href={`/tenant-leasing/matching?leadId=${item.id}`}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              マッチング候補
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              削除
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">業種</dt>
              <dd className="font-medium text-zinc-900">{item.industry || "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">担当者</dt>
              <dd className="font-medium text-zinc-900">{item.contactName || "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">メール</dt>
              <dd className="font-medium text-zinc-900">{item.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">電話</dt>
              <dd className="font-medium text-zinc-900">{item.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">希望エリア</dt>
              <dd className="font-medium text-zinc-900">
                {item.desiredAreas.length > 0
                  ? item.desiredAreas.join(", ")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">希望賃料</dt>
              <dd className="font-medium text-zinc-900">
                {item.desiredRentMin?.toLocaleString()} 〜{" "}
                {item.desiredRentMax?.toLocaleString()} 円
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">希望面積</dt>
              <dd className="font-medium text-zinc-900">
                {item.desiredAreaMin} 〜 {item.desiredAreaMax} ㎡
              </dd>
            </div>
            {item.expansionNotes && (
              <div>
                <dt className="text-zinc-500">出店動向</dt>
                <dd className="font-medium text-zinc-900 whitespace-pre-wrap">
                  {item.expansionNotes}
                </dd>
              </div>
            )}
            {item.memo && (
              <div>
                <dt className="text-zinc-500">メモ</dt>
                <dd className="font-medium text-zinc-900 whitespace-pre-wrap">
                  {item.memo}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </main>
    </div>
  );
}
