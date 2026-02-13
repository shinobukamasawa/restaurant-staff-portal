"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PropertyNewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    area: "",
    rentMin: "",
    rentMax: "",
    allowedIndustries: "",
    availableFrom: "",
    memo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/tenant-leasing/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          area: Number(form.area) || 0,
          rentMin: Number(form.rentMin) || 0,
          rentMax: Number(form.rentMax) || 0,
          allowedIndustries: form.allowedIndustries
            ? form.allowedIndustries.split(/[,、]/).map((s) => s.trim())
            : [],
          availableFrom: form.availableFrom,
          memo: form.memo,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/tenant-leasing/properties/${data.id}`);
        return;
      }
      alert("登録に失敗しました");
    } catch {
      alert("登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/tenant-leasing/properties"
        className="text-sm text-zinc-600 hover:text-zinc-900"
      >
        ← 物件一覧
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
        物件を登録
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            物件名 *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            住所
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              面積（㎡）
            </label>
            <input
              type="number"
              min={0}
              value={form.area}
              onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              空き予定日
            </label>
            <input
              type="date"
              value={form.availableFrom}
              onChange={(e) =>
                setForm((f) => ({ ...f, availableFrom: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              賃料下限（円）
            </label>
            <input
              type="number"
              min={0}
              value={form.rentMin}
              onChange={(e) =>
                setForm((f) => ({ ...f, rentMin: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              賃料上限（円）
            </label>
            <input
              type="number"
              min={0}
              value={form.rentMax}
              onChange={(e) =>
                setForm((f) => ({ ...f, rentMax: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            業種制限（カンマ区切り、空欄で制限なし）
          </label>
          <input
            type="text"
            placeholder="飲食, 小売"
            value={form.allowedIndustries}
            onChange={(e) =>
              setForm((f) => ({ ...f, allowedIndustries: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            メモ
          </label>
          <textarea
            rows={3}
            value={form.memo}
            onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {submitting ? "登録中..." : "登録"}
          </button>
          <Link
            href="/tenant-leasing/properties"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </main>
  );
}
