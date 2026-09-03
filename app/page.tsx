import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { FlowDiagram } from "@/components/FlowDiagram";
import { H2 } from "@/components/Heading";
import { Table } from "@/components/Table";
import {
  API_VERSION,
  CHECKLIST,
  EXAMPLE_HEALTH_URL,
  EXAMPLE_VERIFY_URL,
  HANDOVER,
  RATE_LIMIT_TEXT,
  VERIFY_REQUEST_CURL,
} from "@/content/spec";

export const metadata: Metadata = {
  title: "Overview",
  description: "You host one HTTPS URL. Allo calls it with a phone number. You answer with JSON.",
};

export default function OverviewPage() {
  return (
    <article>
      <h1 className="text-2xl font-semibold tracking-tight">What you build</h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        Allo finances mobile phones in Ethiopia. When one of your drivers applies for Allo
        financing, Allo verifies they are an active, tenured driver on your platform. You host one
        HTTPS endpoint — Allo calls it with a phone number, and you respond with JSON.
      </p>

      <FlowDiagram />

      <p className="mt-8 text-[15px] leading-7 text-muted">
        The important part: <strong>Allo calls you. You never call Allo.</strong> You build one
        endpoint and wait. When a driver applies, Allo asks you one question — is this phone
        number an active driver on your platform? — and you answer yes or no.
      </p>

      <H2>What changes hands at setup</H2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        Four things, exchanged once. Two come from you, two come from Allo (the signing secret is
        optional; the minimum tenure is agreed at onboarding).
      </p>
      <Table
        columns={["Item", "Direction", "What it is"]}
        rows={HANDOVER.map((h) => [h.item, h.from, h.what])}
      />

      <H2>The two URLs</H2>
      <Table
        columns={["Method", "URL", "Purpose"]}
        rows={[
          ["POST", EXAMPLE_VERIFY_URL, "Check a driver by phone"],
          ["GET", EXAMPLE_HEALTH_URL, "Liveness check (Allo appends /health)"],
        ]}
      />
      <CodeBlock code={EXAMPLE_VERIFY_URL} label="your HTTPS URL" />

      <div className="my-4 border border-accent/30 bg-accent/5 px-4 py-3">
        <p className="text-sm text-muted">
          <span className="mr-1.5 font-medium text-accent">Note:</span>
          Your URL must start with{" "}
          <code className="font-mono text-accent">https://</code>.
        </p>
      </div>

      <p className="text-[15px] leading-7 text-muted">
        Version <code className="font-mono text-accent">{API_VERSION}</code> is sent as{" "}
        <code className="font-mono text-accent">X-Allo-API-Version</code>. Allo waits 8 seconds for
        a driver check and 5 seconds for health. If your server errors or times out, Allo retries
        once after 1 second. A 401 or other 4xx is not retried.
      </p>

      <H2>Try it</H2>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        Replace the URL and key with your own, then run:
      </p>
      <CodeBlock code={VERIFY_REQUEST_CURL} label="curl" language="bash" />

      <H2>Rate limits</H2>
      <p className="mt-3 text-[15px] leading-7 text-muted">{RATE_LIMIT_TEXT}</p>

      <H2>Before you go live</H2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-muted">
        {CHECKLIST.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>

      <p className="mt-8 text-[15px] leading-7 text-muted">
        For coding tools:{" "}
        <a className="text-accent underline-offset-2 hover:underline" href="/spec.md">
          /spec.md
        </a>{" "}
        and{" "}
        <a className="text-accent underline-offset-2 hover:underline" href="/llms.txt">
          /llms.txt
        </a>
        .
      </p>
    </article>
  );
}
