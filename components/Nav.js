"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",          label: "Огляд" },
  { href: "/customers", label: "Клієнти" },
  { href: "/cohorts",   label: "Когорти" },
  { href: "/forecast",  label: "Прогнози" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-500 font-black text-lg shadow-sm">М</div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">MimiBon — аналітика продажів</h1>
            <p className="text-sm opacity-90">Період даних: 07.05.2026 – 26.05.2026</p>
          </div>
        </div>
        <nav className="flex gap-2 items-center">
          {links.map(l => {
            const active = path === l.href;
            return (
              <Link key={l.href} href={l.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  active
                    ? "bg-white text-brand-600 shadow"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}>
                {l.label}
              </Link>
            );
          })}
          <a href="/api/logout"
             className="px-3 py-2 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/10 transition"
             title="Вийти">
            ⏻
          </a>
        </nav>
      </div>
    </header>
  );
}
