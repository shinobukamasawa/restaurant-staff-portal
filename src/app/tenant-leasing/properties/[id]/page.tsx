"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Property = {
  id: string;
  name: string;
  address: string;
  area: number;
  rentMin: number;
  rentMax: number;
  allowedIndustries: string[];
  availableFrom: string;
  memo: string;
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [item, setItem] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tenant-leasing/properties/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("この物件を削除しますか？")) return;
    const res = await fetch(`/api/tenant-leasing/properties/${id}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/tenant-leasing/properties");
    else alert("削除に失敗しました");
  };

  if (loading) return <p className="p-8 text-zinc-500">読み込み中...</p>;
  if (!item) return <p className="p-8 text-zinc-500">物件が見つかりません。</p>;

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/tenant-leasing/properties"
        className="text-sm text-zinc-600 hover:text-zinc-900"
      >
        ← 物件一覧
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-zinc-900">{item.name}</h1>
        <div className="flex gap-2">
          <Link
            href={`/tenant-leasing/matching?propertyId=${item.id}`}
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
            <dt className="text-zinc-500">住所</dt>
            <dd className="font-medium text-zinc-900">{item.address || "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">面積</dt>
            <dd className="font-medium text-zinc-900">{item.area} ㎡</dd>
          </div>
          <div>
            <dt className="text-zinc-500">賃料</dt>
            <dd className="font-medium text-zinc-900">
              {item.rentMin.toLocaleString()} 〜 {item.rentMax.toLocaleString()} 円
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">業種制限</dt>
            <dd className="font-medium text-zinc-900">
              {item.allowedIndustries.length > 0
                ? item.allowedIndustries.join(", ")
                : "制限なし"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">空き予定日</dt>
            <dd className="font-medium text-zinc-900">
              {item.availableFrom || "未定"}
            </dd>
          </div>
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
  );
}
