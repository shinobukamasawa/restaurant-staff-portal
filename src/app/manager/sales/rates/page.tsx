"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SalesDayRate = { dayOfWeek: number; label: string; rate: number };

const DOW_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export default function SalesRatesPage() {
  const [rates, setRates] = useState<SalesDayRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/sales/rates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRates(data);
        else setRates(DOW_LABELS.map((label, i) => ({ dayOfWeek: i, label, rate: 100 })));
      })
      .catch(() => setRates(DOW_LABELS.map((label, i) => ({ dayOfWeek: i, label, rate: 100 }))))
      .finally(() => setLoading(false));
  }, []);

  const updateRate = (dayOfWeek: number, rate: number) => {
    setRates((prev) =>
      prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, rate } : r))
    );
  };

  const total = rates.reduce((s, r) => s + r.rate, 0);
  const average = total / 7;
  const isValidAverage = Math.abs(average - 100) < 0.01;

  const handleSave = async () => {
    if (!isValidAverage) {
      setMessage({
        type: "error",
        text: "7曜日の率の平均が100%になるように入力してください。（現在の平均: " + Math.round(average * 100) / 100 + "%）",
      });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sales/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rates),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "保存に失敗しました" });
        return;
      }
      setMessage({ type: "ok", text: "保存しました。" });
    } catch {
      setMessage({ type: "error", text: "通信エラーです。" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-8">
        <p className="text-zinc-500">読み込み中…</p>
      </main>
    );
  }

  return (
      <main className="mx-auto max-w-2xl px-6 py-8">
        <header className="mb-6 flex items-center gap-4">
          <Link
            href="/manager/dashboard"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            ← ダッシュボード
          </Link>
        </header>
        <h1 className="text-2xl font-semibold text-zinc-900">売上・曜日率</h1>
        <p className="mt-1 text-sm text-zinc-600">
          曜日ごとの売上率（％）を設定します。7曜日の平均が100%になるように入力してください。月間目標を日別に按分するときに使用します。
        </p>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-600">
                <th className="pb-2 font-medium">曜日</th>
                <th className="pb-2 font-medium">率（％）</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.dayOfWeek} className="border-b border-zinc-100">
                  <td className="py-3 font-medium text-zinc-800">{r.label}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        step={0.05}
                        value={r.rate}
                        onChange={(e) =>
                          updateRate(r.dayOfWeek, Number(e.target.value) || 0)
                        }
                        className="w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-right"
                      />
                      <span className="text-zinc-600">%</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-zinc-600">
            平均: <strong>{Math.round(average * 100) / 100}%</strong>
            {!isValidAverage && (
              <span className="ml-2 text-red-600">
                平均が100%になるように入力してください。
              </span>
            )}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isValidAverage}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? "保存中…" : "保存"}
            </button>
            {message && (
              <span
                className={
                  message.type === "ok"
                    ? "text-sm text-green-600"
                    : "text-sm text-red-600"
                }
              >
                {message.text}
              </span>
            )}
          </div>
        </section>
      </main>
  );
}
