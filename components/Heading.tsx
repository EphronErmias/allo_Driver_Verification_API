import type { ReactNode } from "react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function H2({ children }: { children: ReactNode }) {
  const id = typeof children === "string" ? slugify(children) : undefined;
  return (
    <h2 id={id} className="group mt-10 text-lg font-semibold scroll-mt-8">
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 text-muted/0 transition group-hover:text-muted"
          aria-label={`Link to ${children}`}
        >
          #
        </a>
      )}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  const id = typeof children === "string" ? slugify(children) : undefined;
  return (
    <h3 id={id} className="group mt-8 text-base font-semibold scroll-mt-8">
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 text-muted/0 transition group-hover:text-muted"
          aria-label={`Link to ${children}`}
        >
          #
        </a>
      )}
    </h3>
  );
}
