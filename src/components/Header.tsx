"use client";

import { useState, useEffect } from "react";
import { getAuth, clearAuth, type Role } from "@/lib/auth";

export default function Header() {
  const [role, setRole] = useState<Role | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    setRole(auth?.role ?? null);
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setRole(null);
    window.location.href = "/";
  };

  return (
    <header className="border-b border-[#E8E3DF] bg-[#FFFBF7]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-[#2B2523]">
          <svg className="h-4 w-4 text-[#C4A882]" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="7" cy="5.5" r="2" />
            <circle cx="17" cy="5.5" r="2" />
            <circle cx="3.5" cy="10" r="1.8" />
            <circle cx="20.5" cy="10" r="1.8" />
            <ellipse cx="12" cy="15.5" rx="6" ry="5.5" />
          </svg>
          飲食店 社員専用ポータル（試作）
        </a>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-xs text-[#6B5D58] sm:gap-4">
          <a href="/dashboard" className="hover:text-[#2B2523]">
            ダッシュボード
          </a>
          <a href="/reports" className="hover:text-[#2B2523]">
            日報一覧
          </a>
          <a href="/reports/new" className="hover:text-[#2B2523]">
            日報入力
          </a>
          <a href="/reports/zenin" className="hover:text-[#2B2523]">
            全員用日報
          </a>
          <a href="/shifts" className="hover:text-[#2B2523]">
            シフト
          </a>
          <a href="/notices" className="hover:text-[#2B2523]">
            お知らせ
          </a>
          {mounted && role === "manager" && (
            <>
              <a href="/manager/dashboard" className="hover:text-[#2B2523]">
                店長用
              </a>
              <a href="/manager/shifts/upload" className="hover:text-[#2B2523]">
                シフトCSV
              </a>
              <a href="/manager/reports/new" className="hover:text-[#2B2523]">
                店長日報
              </a>
              <a href="/manager/notices/new" className="hover:text-[#2B2523]">
                お知らせ投稿
              </a>
              <a href="/manager/sales/daily" className="hover:text-[#2B2523]">
                売上
              </a>
              <a href="/manager/representatives" className="hover:text-[#2B2523]">
                代表者割当
              </a>
              <a href="/manager/users" className="hover:text-[#2B2523]">
                ユーザー登録
              </a>
              <a href="/reports/timeslot" className="hover:text-[#2B2523]">
                時間帯日報
              </a>
            </>
          )}
          {mounted && role === "hq" && (
            <>
              <a href="/hq/dashboard" className="hover:text-[#2B2523]">
                本部用
              </a>
              <a href="/hq/reports" className="hover:text-[#2B2523]">
                店長日報
              </a>
              <a href="/hq/zenin-reports" className="hover:text-[#2B2523]">
                全員日報
              </a>
              <a href="/hq/timeslot-reports" className="hover:text-[#2B2523]">
                時間帯日報
              </a>
              <a href="/manager/sales/targets" className="hover:text-[#2B2523]">
                売上目標
              </a>
              <a href="/manager/users" className="hover:text-[#2B2523]">
                ユーザー登録
              </a>
            </>
          )}
          {mounted ? (
            role != null ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hover:text-[#2B2523]"
              >
                ログアウト
              </button>
            ) : (
              <a href="/login" className="hover:text-[#2B2523]">
                ログイン
              </a>
            )
          ) : (
            <a href="/login" className="hover:text-[#2B2523]">
              ログイン
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
