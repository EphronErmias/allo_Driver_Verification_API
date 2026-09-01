"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/content/spec";

export function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Docs">
      <ul className="flex flex-wrap gap-1 md:flex-col md:gap-0">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-accent/15 text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
