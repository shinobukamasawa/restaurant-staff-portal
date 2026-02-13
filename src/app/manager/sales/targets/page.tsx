"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Target = { storeId: string; yearMonth: string; amount: number };

const STORES = [
  { id: "store-a", name: "A店" },
  { id: "store-b", name: "B店" },
];

function formatYm(ym: string) {
  const [y, m] = ym.split("-");
  return `${y}年${m}月`;
}

export default function SalesTargetsPage() {
  const [storeId, setStoreId] = useState("store-a");
  const [list, setList] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [addYearMonth, setAddYearMonth] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<{ yearMonth: string; amount: string } | null>(null);

  useEffect(() => {
    const ym = new Date();
    setAddYearMonth(
      `${ym.getFullYear()}-${String(ym.getMonth() + 1).padStart(2, "0")}`
    );
  }, []);

  const load = () => {
    setLoading(true);
    fetch(`/api/sales/targets-monthly?storeId=${storeId}`)
      .then((r) => r.json())
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [storeId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addYearMonth || !addAmount) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sales/targets-monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          yearMonth: addYearMonth,
          amount: Number(addAmount) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "登録に失敗しました" });
        return;
      }
      setMessage({ type: "ok", text: "登録しました。" });
      setAddAmount("");
      load();
    } catch {
      setMessage({ type: "error", text: "通信エラーです。" });
    } finally {
      setSaving(false);
    }
  };

  const handlePatch = async (yearMonth: string, amount: number) => {
    setMessage(null);
    try {
      const res = await fetch("/api/sales/targets-monthly", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, yearMonth, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "更新に失敗しました" });
        return;
      }
      setMessage({ type: "ok", text: "更新しました。" });
      setEditing(null);
      load();
    } catch {
      setMessage({ type: "error", text: "通信エラーです。" });
    }
  };

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
        <h1 className="text-2xl font-semibold text-zinc-900">月間売上目標</h1>
        <p className="mt-1 text-sm text-zinc-600">
          店舗・年月ごとの月間目標（円）を登録・編集します。
        </p>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700">店舗</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="mt-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleAdd} className="mb-6 flex flex-wrap items-end gap-3 border-b border-zinc-100 pb-4">
            <div>
              <label className="block text-xs text-zinc-500">年月</label>
              <input
                type="month"
                value={addYearMonth}
                onChange={(e) => setAddYearMonth(e.target.value)}
                className="mt-0.5 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500">目標（円）</label>
              <input
                type="number"
                min={0}
                step={10000}
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="mt-0.5 w-32 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-right"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !addYearMonth}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? "登録中…" : "登録"}
            </button>
          </form>

          {message && (
            <p
              className={
                message.type === "ok"
                  ? "text-sm text-green-600"
                  : "text-sm text-red-600"
              }
            >
              {message.text}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-zinc-500">読み込み中…</p>
          ) : (
            <ul className="space-y-2">
              {list
                .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
                .map((t) => (
                  <li
                    key={`${t.storeId}-${t.yearMonth}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 py-2 px-3"
                  >
                    <span className="font-medium text-zinc-800">
                      {formatYm(t.yearMonth)}
                    </span>
                    {editing?.yearMonth === t.yearMonth ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={10000}
                          value={editing.amount}
                          onChange={(e) =>
                            setEditing({ ...editing, amount: e.target.value })
                          }
                          className="w-28 rounded border border-zinc-300 px-2 py-1 text-right text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handlePatch(t.yearMonth, Number(editing.amount) || 0)
                          }
                          className="text-sm text-zinc-600 hover:text-zinc-900"
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="text-sm text-zinc-500 hover:text-zinc-700"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-700">
                          {t.amount.toLocaleString()}円
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditing({
                              yearMonth: t.yearMonth,
                              amount: String(t.amount),
                            })
                          }
                          className="text-sm text-zinc-500 hover:text-zinc-800"
                        >
                          編集
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              {list.length === 0 && (
                <li className="py-4 text-center text-sm text-zinc-500">
                  まだ目標がありません。上で年月と金額を入力して登録してください。
                </li>
              )}
            </ul>
          )}
        </section>

        <p className="mt-4 text-sm text-zinc-500">
          <Link href="/manager/sales/rates" className="underline hover:no-underline">
            曜日率の設定
          </Link>
          {" · "}
          <Link href="/manager/sales/daily" className="underline hover:no-underline">
            日別売上入力
          </Link>
        </p>
      </main>
  );
}
