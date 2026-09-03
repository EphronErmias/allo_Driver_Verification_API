"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { FRAMEWORKS, type FrameworkId } from "@/content/spec";

export function FrameworkTabs() {
  const [active, setActive] = useState<FrameworkId>("node");

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
                  ? "bg-white text-black font-medium"
                  : "text-muted hover:bg-white hover:text-black"
              }`}
            >
              {fw.label}
            </button>
          );
        })}
      </div>
      {FRAMEWORKS.map((fw) => (
        <div
          key={fw.id}
          role="tabpanel"
          className={fw.id === active ? "" : "hidden"}
          aria-hidden={fw.id !== active}
        >
          <CodeBlock code={fw.code} label={fw.label} language={fw.language} />
        </div>
      ))}
    </div>
  );
}
