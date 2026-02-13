export default function Footer() {
  return (
    <footer className="border-t border-[#E8E3DF] py-8 text-center">
      <p className="text-xs text-[#9B8B7E]">飲食店 社員専用ポータル</p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#C4B5AA]">
        Powered by Monosuke
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="7" cy="5.5" r="2" />
          <circle cx="17" cy="5.5" r="2" />
          <circle cx="3.5" cy="10" r="1.8" />
          <circle cx="20.5" cy="10" r="1.8" />
          <ellipse cx="12" cy="15.5" rx="6" ry="5.5" />
        </svg>
      </p>
    </footer>
  );
}
