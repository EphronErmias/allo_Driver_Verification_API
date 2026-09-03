"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/content/spec";

export function Nav() {
  const pathname = usePathname();

  const list = (
    <ul className="flex flex-col gap-0">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block border-l-2 px-3 py-1.5 text-sm transition ${
                active
                  ? "border-accent bg-white text-black font-medium"
                  : "border-transparent text-muted hover:bg-white hover:text-black"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile: collapsible */}
      <details className="md:hidden">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground">
          Menu
        </summary>
        <nav aria-label="Docs">{list}</nav>
      </details>

      {/* Desktop: always visible */}
      <nav aria-label="Docs" className="hidden md:block">
        {list}
      </nav>
    </>
  );
}
