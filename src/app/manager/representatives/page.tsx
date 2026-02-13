"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORES = [
  { id: "store-a", name: "A店" },
  { id: "store-b", name: "B店" },
];

type TimeSlot = { id: string; name: string; sortOrder: number };
type User = { id: string; displayName: string; role: string; storeId?: string };
type Assignment = { date: string; storeId: string; timeSlotId: string; userId: string };
type ShiftRow = { date: string; dayOfWeek: string; startTime: string; endTime: string; displayName: string };

function RepSelect({
  users,
  shiftRows,
  valueBySlot,
  slots,
  onChange,
}: {
  users: User[];
  shiftRows: ShiftRow[];
  valueBySlot: Record<string, string>;
  slots: TimeSlot[];
  onChange: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
}) {
  // 参照シフトの表示名の出現順でリスト化（重複除く）。表示名→userId のマップを用意
  const userByDisplayName = new Map<string, string>();
  users.forEach((u) => {
    const k = u.displayName.trim();
    if (k) userByDisplayName.set(k, u.id);
    const kId = u.id.trim();
    if (kId) userByDisplayName.set(kId, u.id);
  });
  const seen = new Set<string>();
  const onShiftFromShift: { displayName: string; userId: string }[] = [];
  shiftRows.forEach((r) => {
    const name = r.displayName.trim();
    if (!name || seen.has(name)) return;
    const uid = userByDisplayName.get(name);
    if (uid) {
      seen.add(name);
      onShiftFromShift.push({ displayName: name, userId: uid });
    }
  });
  const onShiftUserIds = new Set(onShiftFromShift.map((x) => x.userId));
  const otherUsers = users.filter((u) => !onShiftUserIds.has(u.id));

  return (
    <div className="space-y-3">
      {slots.map((slot) => (
        <div key={slot.id} className="flex items-center gap-3">
          <span className="w-28 text-sm font-medium text-zinc-800">{slot.name}</span>
          <select
            value={valueBySlot[slot.id] ?? ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, [slot.id]: e.target.value }))
            }
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">未割り当て</option>
            {onShiftFromShift.length > 0 && (
              <optgroup label="該当日のシフト">
                {onShiftFromShift.map(({ displayName, userId }) => (
                  <option key={`${userId}-${displayName}`} value={userId}>
                    {displayName}
                  </option>
                ))}
              </optgroup>
            )}
            {otherUsers.length > 0 && (
              <optgroup label="その他">
                {otherUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName}
                  </option>
                ))}
              </optgroup>
            )}
            {onShiftFromShift.length === 0 && otherUsers.length === 0 && (
              users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName}
                </option>
              ))
            )}
          </select>
        </div>
      ))}
    </div>
  );
}

export default function RepresentativesPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [storeId, setStoreId] = useState("store-a");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [shiftRows, setShiftRows] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const defaultSlots: TimeSlot[] = [
    { id: "lunch", name: "ランチ", sortOrder: 1 },
    { id: "afternoon", name: "アフタヌーン", sortOrder: 2 },
    { id: "dinner", name: "ディナー", sortOrder: 3 },
  ];

  useEffect(() => {
    Promise.all([
      fetch("/api/timeslots").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([s, u]) => {
      setSlots(Array.isArray(s) && s.length > 0 ? s : defaultSlots);
      setUsers(Array.isArray(u) ? u : []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/representative-assignments?date=${date}&storeId=${storeId}`).then((r) =>
        r.json()
      ),
      fetch(`/api/shifts/by-date?date=${date}&storeId=${storeId}`).then((r) => r.json()),
    ])
      .then(([list, shiftData]) => {
        const map: Record<string, string> = {};
        (Array.isArray(list) ? list : []).forEach((a: Assignment) => {
          map[a.timeSlotId] = a.userId;
        });
        setAssignments(map);
        const raw = shiftData.rows;
        setShiftRows(
          Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object" && "date" in raw[0]
            ? raw as ShiftRow[]
            : []
        );
      })
      .finally(() => setLoading(false));
  }, [date, storeId]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/representative-assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          storeId,
          assignments: (slots.length > 0 ? slots : defaultSlots).map((s) => ({
            timeSlotId: s.id,
            userId: assignments[s.id] || "",
          })),
        }),
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

  return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-6 flex items-center gap-4">
          <Link
            href="/manager/dashboard"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            ← ダッシュボード
          </Link>
        </header>
        <h1 className="text-2xl font-semibold text-zinc-900">時間帯別 代表者割り当て</h1>
        <p className="mt-1 text-sm text-zinc-600">
          日付・店舗を選び、各時間帯の代表者を決めます。該当日のシフトに出ている名前から選ぶほか、急な欠勤等でシフトが変わっている場合は「その他」からも代表者を選べます。
        </p>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs text-zinc-500">日付</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-0.5 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500">店舗</label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="mt-0.5 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm"
              >
                {STORES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? "保存中…" : "割り当てを保存"}
            </button>
          </div>

          {message && (
            <p
              className={
                message.type === "ok" ? "mb-3 text-sm text-green-600" : "mb-3 text-sm text-red-600"
              }
            >
              {message.text}
            </p>
          )}

          <h2 className="mb-2 text-sm font-medium text-zinc-700">
            {date} のシフト（参照用）・日付・曜日・開始・終了・表示名のみ
          </h2>
          {loading ? (
            <p className="text-sm text-zinc-500">読み込み中…</p>
          ) : shiftRows.length > 0 ? (
            <div className="mb-6 overflow-x-auto rounded-lg border border-zinc-200">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-zinc-100 font-medium">
                    <th className="border-b border-zinc-200 px-2 py-1.5 text-left">日付</th>
                    <th className="border-b border-zinc-200 px-2 py-1.5 text-left">曜日</th>
                    <th className="border-b border-zinc-200 px-2 py-1.5 text-left">開始時間</th>
                    <th className="border-b border-zinc-200 px-2 py-1.5 text-left">終了時間</th>
                    <th className="border-b border-zinc-200 px-2 py-1.5 text-left">表示名</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftRows.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-100">
                      <td className="px-2 py-1.5">{row.date}</td>
                      <td className="px-2 py-1.5">{row.dayOfWeek}</td>
                      <td className="px-2 py-1.5">{row.startTime}</td>
                      <td className="px-2 py-1.5">{row.endTime}</td>
                      <td className="px-2 py-1.5">{row.displayName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mb-6 text-sm text-zinc-500">
              該当日のシフトデータがありません。シフトCSVを取込済みの月・店舗か確認してください。
            </p>
          )}

          <h2 className="mb-2 text-sm font-medium text-zinc-700">時間帯ごとの代表者（割り当て入力）</h2>
          <RepSelect
            users={users}
            shiftRows={shiftRows}
            valueBySlot={assignments}
            slots={slots.length > 0 ? slots : defaultSlots}
            onChange={setAssignments}
          />
        </section>
      </main>
  );
}
