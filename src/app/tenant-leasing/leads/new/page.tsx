"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LeadNewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    contactName: "",
    email: "",
    phone: "",
    desiredAreas: "",
    desiredRentMin: "",
    desiredRentMax: "",
    desiredAreaMin: "",
    desiredAreaMax: "",
    expansionNotes: "",
    memo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/tenant-leasing/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          industry: form.industry,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          desiredAreas: form.desiredAreas
            ? form.desiredAreas.split(/[,、]/).map((s) => s.trim())
            : [],
          desiredRentMin: Number(form.desiredRentMin) || 0,
          desiredRentMax: Number(form.desiredRentMax) || 0,
          desiredAreaMin: Number(form.desiredAreaMin) || 0,
          desiredAreaMax: Number(form.desiredAreaMax) || 0,
          expansionNotes: form.expansionNotes,
          memo: form.memo,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/tenant-leasing/leads/${data.id}`);
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
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-2xl px-6 py-8">
        <Link
          href="/tenant-leasing/leads"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← リード一覧
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          リードを登録
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              企業名 *
            </label>
            <input
              type="text"
              required
              value={form.companyName}
              onChange={(e) =>
                setForm((f) => ({ ...f, companyName: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              業種
            </label>
            <input
              type="text"
              value={form.industry}
              onChange={(e) =>
                setForm((f) => ({ ...f, industry: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                担当者名
              </label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactName: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                電話番号
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              メールアドレス
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              希望エリア（カンマ区切り）
            </label>
            <input
              type="text"
              placeholder="渋谷, 新宿"
              value={form.desiredAreas}
              onChange={(e) =>
                setForm((f) => ({ ...f, desiredAreas: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                希望賃料下限（円）
              </label>
              <input
                type="number"
                min={0}
                value={form.desiredRentMin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, desiredRentMin: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                希望賃料上限（円）
              </label>
              <input
                type="number"
                min={0}
                value={form.desiredRentMax}
                onChange={(e) =>
                  setForm((f) => ({ ...f, desiredRentMax: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                希望面積下限（㎡）
              </label>
              <input
                type="number"
                min={0}
                value={form.desiredAreaMin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, desiredAreaMin: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                希望面積上限（㎡）
              </label>
              <input
                type="number"
                min={0}
                value={form.desiredAreaMax}
                onChange={(e) =>
                  setForm((f) => ({ ...f, desiredAreaMax: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              出店動向メモ
            </label>
            <textarea
              rows={2}
              value={form.expansionNotes}
              onChange={(e) =>
                setForm((f) => ({ ...f, expansionNotes: e.target.value }))
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
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {submitting ? "登録中..." : "登録"}
            </button>
            <Link
              href="/tenant-leasing/leads"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
