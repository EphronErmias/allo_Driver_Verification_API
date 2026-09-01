"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { FRAMEWORKS, type FrameworkId } from "@/content/spec";

export function FrameworkTabs() {
  const [active, setActive] = useState<FrameworkId>("node");
  const current = FRAMEWORKS.find((f) => f.id === active) ?? FRAMEWORKS[0];

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-border" role="tablist" aria-label="Backend">
        {FRAMEWORKS.map((fw) => {
          const selected = fw.id === active;
          return (
            <button
              key={fw.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(fw.id)}
              className={`px-3 py-2 text-sm transition ${
                selected
                  ? "border-b-2 border-accent text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {fw.label}
            </button>
          );
        })}
      </div>
      <CodeBlock code={current.code} label={current.label} language={current.language} />
    </div>
  );
}
