"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const SALES_OPTIONS = ["目標大幅超過", "目標達成", "ほぼ目標", "目標未達"];
const CONDITION_OPTIONS = ["とても良い", "良い", "普通", "あまり良くない"];
const STAFFING_OPTIONS = ["余裕あり", "ちょうど良い", "ぎりぎり", "不足"];
const EVENT_OPTIONS = ["クレーム", "大口予約", "トラブル", "スタッフ体調不良", "特になし"];
const THEME_OPTIONS = ["オペレーション", "接客品質", "料理品質", "清掃・衛生", "数字（売上・利益）", "教育・育成"];

type ZeninRow = { userId: string; condition: string; busyLevel: string; trouble: string; goodPoint: string; memo: string };
type TimeslotRow = { timeSlotId: string; userId: string; salesEvaluation: string; storeCondition: string; staffing: string; events: string[]; memo: string };

export default function ManagerReportNewPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [storeId, setStoreId] = useState("store-a");
  const [salesEvaluation, setSalesEvaluation] = useState("");
  const [storeCondition, setStoreCondition] = useState("");
  const [staffing, setStaffing] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [dailySales, setDailySales] = useState<{ target: number; actual: number; achievement: number } | null>(null);
  const [zeninList, setZeninList] = useState<ZeninRow[]>([]);
  const [timeslotList, setTimeslotList] = useState<TimeslotRow[]>([]);
  const [slotNames, setSlotNames] = useState<Record<string, string>>({});

  const yearMonth = date.slice(0, 7);
  useEffect(() => {
    Promise.all([
      fetch(`/api/sales/summary?storeId=${storeId}&yearMonth=${yearMonth}`).then((r) => r.json()),
      fetch(`/api/zenin-reports?date=${date}&storeId=${storeId}`).then((r) => r.json()),
      fetch(`/api/timeslot-reports?date=${date}&storeId=${storeId}`).then((r) => r.json()),
      fetch("/api/timeslots").then((r) => r.json()),
    ]).then(([summary, zenin, timeslot, slots]) => {
      const day = summary?.daily?.find((d: { date: string }) => d.date === date);
      setDailySales(day ? { target: day.target, actual: day.actual, achievement: day.achievement } : null);
      setZeninList(Array.isArray(zenin) ? zenin : []);
      setTimeslotList(Array.isArray(timeslot) ? timeslot : []);
      const names: Record<string, string> = {};
      (Array.isArray(slots) ? slots : []).forEach((s: { id: string; name: string }) => {
        names[s.id] = s.name;
      });
      setSlotNames(names);
    });
  }, [date, storeId, yearMonth]);

  const toggleEvent = (v: string) => {
    setEvents((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };
  const toggleTheme = (v: string) => {
    setThemes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);
    try {
      const summaryRes = await fetch(
        `/api/reports/daily-summary?date=${date}&storeId=${storeId}&type=combined`
      );
      const summaryData = await summaryRes.json();
      const combinedSummary = summaryData.summary ?? "";

      const res = await fetch("/api/manager-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          storeId,
          salesEvaluation,
          storeCondition,
          staffing,
          events,
          themes,
          memo,
          combinedSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "保存に失敗しました");
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("error");
      setErrorMessage("通信エラーです。");
    }
  };

  return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-6">
          <Link href="/manager/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
            ← ダッシュボード
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">店長・マネージャー 日報入力</h1>
          <p className="mt-1 text-sm text-zinc-600">
            その日の全員日報・時間帯別日報（元データ）を参照し、まとめを書きます。保存時に統合要約を張り付けます。
          </p>
        </header>

        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-700">参照（元データ）</h2>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs text-zinc-500">その日の日別売上</p>
              {dailySales ? (
                <p className="text-sm text-zinc-800">
                  目標 {dailySales.target.toLocaleString()}円 / 実績 {dailySales.actual.toLocaleString()}円
                  {dailySales.target > 0 && `（達成率 ${dailySales.achievement}%）`}
                </p>
              ) : (
                <p className="text-sm text-zinc-500">未入力またはデータなし</p>
              )}
            </div>
            <div>
              <p className="text-xs text-zinc-500">その日の全員日報</p>
              {zeninList.length > 0 ? (
                <ul className="mt-1 space-y-1 text-sm text-zinc-800">
                  {zeninList.map((z, i) => (
                    <li key={i}>
                      {z.userId}: 体調{z.condition} / 忙しさ{z.busyLevel} / 困った{z.trouble} / 良かった{z.goodPoint}
                      {z.memo && ` / ${z.memo}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">未入力</p>
              )}
            </div>
            <div>
              <p className="text-xs text-zinc-500">その日の時間帯別日報</p>
              {timeslotList.length > 0 ? (
                <ul className="mt-1 space-y-1 text-sm text-zinc-800">
                  {timeslotList.map((t, i) => (
                    <li key={i}>
                      {slotNames[t.timeSlotId] || t.timeSlotId}: 売上{t.salesEvaluation} 店舗{t.storeCondition} 人手{t.staffing}
                      {t.events?.length ? ` ${t.events.join(",")}` : ""}
                      {t.memo ? ` / ${t.memo}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">未入力</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700">日付</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">担当店舗</label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="store-a">A店</option>
                  <option value="store-b">B店</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">本日の売上評価</label>
              <select
                value={salesEvaluation}
                onChange={(e) => setSalesEvaluation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">選択してください</option>
                {SALES_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-700">店舗全体の状況</label>
                <select
                  value={storeCondition}
                  onChange={(e) => setStoreCondition(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">選択</option>
                  {CONDITION_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">人員体制</label>
                <select
                  value={staffing}
                  onChange={(e) => setStaffing(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">選択</option>
                  {STAFFING_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">大きな出来事（複数可）</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EVENT_OPTIONS.map((o) => (
                  <label key={o} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={events.includes(o)}
                      onChange={() => toggleEvent(o)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    <span className="text-sm">{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">重点テーマ（複数可）</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {THEME_OPTIONS.map((o) => (
                  <label key={o} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={themes.includes(o)}
                      onChange={() => toggleTheme(o)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    <span className="text-sm">{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">本日の振り返り・本部への共有事項</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                placeholder="自由記述"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {status === "sending" ? "送信中…" : "店長日報を保存"}
            </button>
          </form>

          {status === "ok" && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              保存しました。
            </div>
          )}
          {status === "error" && errorMessage && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errorMessage}
            </div>
          )}
        </section>
      </main>
  );
}
