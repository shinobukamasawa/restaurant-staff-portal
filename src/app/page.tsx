"use client";

import { useState, useEffect } from "react";
import { getAuth, type Role } from "@/lib/auth";

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    setRole(auth?.role ?? null);
    setMounted(true);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        
        .menu-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .menu-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }
        
        .menu-card:active {
          transform: translateY(0);
        }
      `}</style>

      <main className="mx-auto min-h-screen max-w-2xl px-6 py-10 sm:py-16">
        
        {/* ヘッダー */}
        <header className="mb-12 fade-in">
          <h1 className="text-3xl font-semibold text-[#2B2523] mb-2 flex items-center gap-2">
            {mounted && role != null ? (
              <>こんにちは</>
            ) : (
              <>ようこそ</>
            )}
            <svg className="w-8 h-8 inline-block text-[#C4A882]" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="7" cy="5.5" r="2" />
              <circle cx="17" cy="5.5" r="2" />
              <circle cx="3.5" cy="10" r="1.8" />
              <circle cx="20.5" cy="10" r="1.8" />
              <ellipse cx="12" cy="15.5" rx="6" ry="5.5" />
            </svg>
          </h1>
          <p className="text-base text-[#6B5D58]">
            {mounted && role != null ? (
              <>
                {role === "staff" && "社員"}
                {role === "manager" && "店長"}
                {role === "hq" && "本部"}
                ポータル
              </>
            ) : (
              <>社員専用ポータルです</>
            )}
          </p>
        </header>

        {mounted && role != null ? (
          <>
            {/* メインメニュー */}
            <div className="space-y-3 mb-8">
              
              {/* シフト確認 */}
              <a
                href="/shifts"
                className="menu-card group block bg-white rounded-2xl p-5 border border-[#E8E3DF] hover:border-[#D4C5BA] fade-in"
                style={{ animationDelay: '0.05s' }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9B5E] to-[#FF7B3D] flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                      <circle cx="17" cy="17" r="3"/>
                      <path d="M16 16l1 1 2-2"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[#2B2523] mb-0.5">シフト確認</h3>
                    <p className="text-sm text-[#6B5D58]">今月のスケジュール</p>
                  </div>
                  <svg className="w-5 h-5 text-[#C4B5AA] group-hover:text-[#9B8B7E] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              {/* 日報を書く */}
              <a
                href="/reports/new"
                className="menu-card group block bg-white rounded-2xl p-5 border border-[#E8E3DF] hover:border-[#D4C5BA] fade-in"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#8FD4C1] to-[#6BB89F] flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      <line x1="7" y1="10" x2="13" y2="10"/>
                      <line x1="7" y1="14" x2="11" y2="14"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[#2B2523] mb-0.5">日報を書く</h3>
                    <p className="text-sm text-[#6B5D58]">今日のひとこと</p>
                  </div>
                  <svg className="w-5 h-5 text-[#C4B5AA] group-hover:text-[#9B8B7E] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              {/* お知らせ */}
              <a
                href="/notices"
                className="menu-card group block bg-white rounded-2xl p-5 border border-[#E8E3DF] hover:border-[#D4C5BA] fade-in"
                style={{ animationDelay: '0.15s' }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFB84D] to-[#FF9B1A] flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[#2B2523] mb-0.5">お知らせ</h3>
                    <p className="text-sm text-[#6B5D58]">最新の連絡事項</p>
                  </div>
                  <svg className="w-5 h-5 text-[#C4B5AA] group-hover:text-[#9B8B7E] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              {/* ダッシュボード */}
              <a
                href={role === "manager" ? "/manager/dashboard" : role === "hq" ? "/hq/dashboard" : "/dashboard"}
                className="menu-card group block bg-white rounded-2xl p-5 border border-[#E8E3DF] hover:border-[#D4C5BA] fade-in"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#A094E8] to-[#7D6FD9] flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="14" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[#2B2523] mb-0.5">ダッシュボード</h3>
                    <p className="text-sm text-[#6B5D58]">まとめて確認</p>
                  </div>
                  <svg className="w-5 h-5 text-[#C4B5AA] group-hover:text-[#9B8B7E] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            </div>

            {/* サブメニュー */}
            <div className="space-y-2 fade-in" style={{ animationDelay: '0.25s' }}>
              <a
                href="/reports"
                className="menu-card group block bg-[#FFFBF7] rounded-xl p-4 border border-[#F0EBE6] hover:border-[#E0D6CC]"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#9B8B7E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    <line x1="10" y1="8" x2="16" y2="8"/>
                    <line x1="10" y1="12" x2="16" y2="12"/>
                    <line x1="10" y1="16" x2="14" y2="16"/>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2B2523]">過去の日報</p>
                  </div>
                  <svg className="w-4 h-4 text-[#C4B5AA] group-hover:text-[#9B8B7E] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            </div>
          </>
        ) : (
          <>
            {/* 未ログイン時 */}
            <div className="text-center py-16 fade-in">
              {/* クライアントロゴ枠 */}
              <div className="mb-8 mx-auto w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-[#D4C5BA] flex flex-col items-center justify-center">
                <svg className="w-10 h-10 text-[#C4B5AA] mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="10" width="18" height="12" rx="1" />
                  <rect x="7" y="2" width="10" height="20" rx="1" />
                  <line x1="10" y1="6" x2="14" y2="6" />
                  <line x1="10" y1="9" x2="14" y2="9" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                  <rect x="10" y="18" width="4" height="4" />
                </svg>
                <span className="text-[10px] text-[#C4B5AA] font-medium tracking-wide">Client Logo</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#2B2523] mb-3">まずはログイン</h2>
              <p className="text-base text-[#6B5D58] mb-10 max-w-md mx-auto leading-relaxed">
                社員IDとパスワードを入力して、<br />
                ポータルにアクセスしてください
              </p>
              
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#2B2523] hover:bg-[#3D3432] px-6 py-3 text-base font-medium text-white transition-colors shadow-sm"
              >
                <span>ログイン</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>

          </>
        )}

      </main>
    </>
  );
}
